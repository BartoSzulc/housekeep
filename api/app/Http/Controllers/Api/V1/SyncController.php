<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\LocationResource;
use App\Http\Resources\MemberResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TaskCompletionResource;
use App\Http\Resources\TaskResource;
use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use App\Models\Task;
use App\Models\TaskCompletion;
use App\Services\SyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SyncController extends Controller
{
    public function push(Request $request, SyncService $syncService): JsonResponse
    {
        $household = $request->user()->households()->first();

        if (! $household) {
            return response()->json(['message' => 'No household found.'], 404);
        }

        $result = $syncService->processPush($request->all(), $household->id, $request->user());

        return response()->json($result);
    }

    public function pull(Request $request): JsonResponse
    {
        $household = $request->user()->households()->first();

        if (! $household) {
            return response()->json(['message' => 'No household found.'], 404);
        }

        $since = Carbon::parse($request->query('since', '1970-01-01T00:00:00Z'));

        return response()->json([
            'products' => ProductResource::collection(
                Product::where('household_id', $household->id)
                    ->where('updated_at', '>', $since)
                    ->withTrashed()
                    ->with(['location', 'category'])
                    ->get()
            ),
            'tasks' => TaskResource::collection(
                Task::where('household_id', $household->id)
                    ->where('updated_at', '>', $since)
                    ->withTrashed()
                    ->with(['assignedTo', 'completions'])
                    ->get()
            ),
            'task_completions' => TaskCompletionResource::collection(
                TaskCompletion::whereHas('task', fn ($q) =>
                    $q->where('household_id', $household->id))
                    ->where('updated_at', '>', $since)
                    ->get()
            ),
            'locations' => LocationResource::collection(
                Location::where('household_id', $household->id)
                    ->where('updated_at', '>', $since)
                    ->withTrashed()
                    ->get()
            ),
            'categories' => CategoryResource::collection(
                Category::where('household_id', $household->id)
                    ->where('updated_at', '>', $since)
                    ->withTrashed()
                    ->get()
            ),
            'members' => MemberResource::collection(
                $household->members
            ),
            'server_time' => now()->toISOString(),
        ]);
    }
}
