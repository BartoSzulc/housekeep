<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HouseholdResource;
use App\Http\Resources\InviteResource;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Invite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InviteController extends Controller
{
    public function index(Household $household): JsonResponse
    {
        $invites = $household->invites()
            ->where('status', 'pending')
            ->with('invitedBy')
            ->get();

        return response()->json([
            'invites' => InviteResource::collection($invites),
        ]);
    }

    public function store(Request $request, Household $household): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['nullable', 'email'],
        ]);

        $invite = $household->invites()->create([
            'invited_by' => $request->user()->id,
            'email' => $validated['email'] ?? null,
            'expires_at' => now()->addDays(7),
        ]);

        return response()->json([
            'invite' => new InviteResource($invite->load('invitedBy')),
        ], 201);
    }

    public function destroy(Invite $invite): JsonResponse
    {
        $invite->update(['status' => 'revoked']);

        return response()->json(['message' => 'Invite revoked.']);
    }

    public function accept(string $token, Request $request): JsonResponse
    {
        $invite = Invite::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (! $invite) {
            return response()->json(['message' => 'Invalid or expired invite.'], 404);
        }

        if ($invite->isExpired()) {
            $invite->update(['status' => 'expired']);
            return response()->json(['message' => 'This invite has expired.'], 410);
        }

        $alreadyMember = HouseholdMember::where('household_id', $invite->household_id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['message' => 'You are already a member.'], 422);
        }

        $invite->household->members()->attach($request->user()->id, ['role' => 'member']);
        $invite->update(['status' => 'accepted']);

        return response()->json([
            'household' => new HouseholdResource($invite->household->load('members')),
        ]);
    }
}
