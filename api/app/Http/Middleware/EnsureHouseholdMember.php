<?php

namespace App\Http\Middleware;

use App\Models\HouseholdMember;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHouseholdMember
{
    public function handle(Request $request, Closure $next): Response
    {
        $household = $request->route('household');
        $householdId = is_object($household) ? $household->id : (int) $household;

        $isMember = HouseholdMember::where('household_id', $householdId)
            ->where('user_id', $request->user()->id)
            ->exists();

        if (! $isMember) {
            abort(403, 'You are not a member of this household.');
        }

        return $next($request);
    }
}
