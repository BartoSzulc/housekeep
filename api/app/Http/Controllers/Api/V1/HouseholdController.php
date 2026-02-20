<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Household\StoreHouseholdRequest;
use App\Http\Resources\HouseholdResource;
use App\Http\Resources\MemberResource;
use App\Models\Household;
use App\Models\HouseholdMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HouseholdController extends Controller
{
    public function store(StoreHouseholdRequest $request): JsonResponse
    {
        $household = Household::create([
            'name' => $request->name,
            'created_by' => $request->user()->id,
        ]);

        $household->members()->attach($request->user()->id, ['role' => 'owner']);

        return response()->json([
            'household' => new HouseholdResource($household->load('members')),
        ], 201);
    }

    public function join(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invite_code' => ['required', 'string', 'size:8'],
        ]);

        $household = Household::where('invite_code', strtoupper($validated['invite_code']))->first();

        if (! $household) {
            return response()->json(['message' => 'Invalid invite code.'], 404);
        }

        $alreadyMember = HouseholdMember::where('household_id', $household->id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['message' => 'You are already a member of this household.'], 422);
        }

        $household->members()->attach($request->user()->id, ['role' => 'member']);

        return response()->json([
            'household' => new HouseholdResource($household->load('members')),
        ]);
    }

    public function show(Household $household): JsonResponse
    {
        return response()->json([
            'household' => new HouseholdResource($household->load('members')),
        ]);
    }

    public function update(Request $request, Household $household): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $household->update($validated);

        return response()->json([
            'household' => new HouseholdResource($household->fresh()->load('members')),
        ]);
    }

    public function members(Household $household): JsonResponse
    {
        return response()->json([
            'members' => MemberResource::collection($household->members),
        ]);
    }

    public function removeMember(Household $household, int $userId): JsonResponse
    {
        $member = HouseholdMember::where('household_id', $household->id)
            ->where('user_id', $userId)
            ->first();

        if (! $member) {
            return response()->json(['message' => 'User is not a member.'], 404);
        }

        if ($member->role === 'owner') {
            return response()->json(['message' => 'Cannot remove the owner.'], 422);
        }

        $member->delete();

        return response()->json(['message' => 'Member removed.']);
    }
}
