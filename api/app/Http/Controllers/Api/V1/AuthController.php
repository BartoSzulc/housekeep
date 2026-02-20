<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\PushToken;
use App\Models\User;
use App\Models\WebPushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user->load('households')),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('households')),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
        ]);

        $request->user()->update($validated);

        return response()->json([
            'user' => new UserResource($request->user()->fresh()),
        ]);
    }

    public function storePushToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'platform' => ['nullable', 'string', 'in:ios,android'],
            'device_id' => ['nullable', 'string'],
        ]);

        PushToken::updateOrCreate(
            ['user_id' => $request->user()->id, 'token' => $validated['token']],
            $validated
        );

        return response()->json(['message' => 'Push token saved.']);
    }

    public function deletePushToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        PushToken::where('user_id', $request->user()->id)
            ->where('token', $validated['token'])
            ->delete();

        return response()->json(['message' => 'Push token removed.']);
    }

    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'key' => config('services.vapid.public_key'),
        ]);
    }

    public function storeWebPushSubscription(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
        ]);

        WebPushSubscription::updateOrCreate(
            ['user_id' => $request->user()->id, 'endpoint' => $validated['endpoint']],
            [
                'p256dh_key' => $validated['keys']['p256dh'],
                'auth_token' => $validated['keys']['auth'],
            ]
        );

        return response()->json(['message' => 'Web push subscription saved.']);
    }

    public function deleteWebPushSubscription(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url'],
        ]);

        WebPushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint', $validated['endpoint'])
            ->delete();

        return response()->json(['message' => 'Web push subscription removed.']);
    }
}
