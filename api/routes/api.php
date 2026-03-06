<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BarcodeController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\HouseholdController;
use App\Http\Controllers\Api\V1\InviteController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\PriceHistoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\NamedShoppingListController;
use App\Http\Controllers\Api\V1\ShoppingListController;
use App\Http\Controllers\Api\V1\SyncController;
use App\Http\Controllers\Api\V1\TaskCompletionController;
use App\Http\Controllers\Api\V1\TaskController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/auth/vapid-key', [AuthController::class, 'vapidPublicKey']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/me', [AuthController::class, 'updateProfile']);
        Route::post('/auth/push-token', [AuthController::class, 'storePushToken']);
        Route::delete('/auth/push-token', [AuthController::class, 'deletePushToken']);
        Route::post('/auth/web-push', [AuthController::class, 'storeWebPushSubscription']);
        Route::delete('/auth/web-push', [AuthController::class, 'deleteWebPushSubscription']);

        // Barcode lookup (OpenFoodFacts)
        Route::get('/barcode/lookup', [BarcodeController::class, 'lookup']);

        // Households
        Route::post('/households', [HouseholdController::class, 'store']);
        Route::post('/households/join', [HouseholdController::class, 'join']);

        // Invite acceptance (by token)
        Route::post('/invites/{token}/accept', [InviteController::class, 'accept']);

        // Household-scoped routes (require membership)
        Route::prefix('households/{household}')
            ->middleware('household.member')
            ->group(function () {

                // Household management
                Route::get('/', [HouseholdController::class, 'show']);
                Route::put('/', [HouseholdController::class, 'update']);
                Route::get('/members', [HouseholdController::class, 'members']);
                Route::delete('/members/{user}', [HouseholdController::class, 'removeMember']);

                // Invites
                Route::get('/invites', [InviteController::class, 'index']);
                Route::post('/invites', [InviteController::class, 'store']);
                Route::delete('/invites/{invite}', [InviteController::class, 'destroy']);

                // Locations
                Route::apiResource('locations', LocationController::class);

                // Categories
                Route::apiResource('categories', CategoryController::class);

                // Products
                Route::get('/products/expiring', [ProductController::class, 'expiring']);
                Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
                Route::get('/products/consumed', [ProductController::class, 'consumed']);
                Route::post('/products/{product}/restock', [ProductController::class, 'restock']);
                Route::post('/products/{product}/consume', [ProductController::class, 'consume']);
                Route::post('/products/{product}/unconsume', [ProductController::class, 'unconsume']);
                Route::apiResource('products', ProductController::class);

                // Price History
                Route::get('/products/{product}/prices', [PriceHistoryController::class, 'index']);
                Route::post('/products/{product}/prices', [PriceHistoryController::class, 'store']);

                // Shopping List (legacy — single global list)
                Route::get('/shopping-list', [ShoppingListController::class, 'index']);
                Route::post('/shopping-list/generate', [ShoppingListController::class, 'generate']);
                Route::put('/shopping-list/toggle/{product}', [ShoppingListController::class, 'toggle']);

                // Named Shopping Lists
                Route::get('/shopping-lists', [NamedShoppingListController::class, 'index']);
                Route::post('/shopping-lists', [NamedShoppingListController::class, 'store']);
                Route::delete('/shopping-lists/{shoppingList}', [NamedShoppingListController::class, 'destroy']);
                Route::get('/shopping-lists/{shoppingList}/items', [NamedShoppingListController::class, 'items']);
                Route::post('/shopping-lists/{shoppingList}/items', [NamedShoppingListController::class, 'addItem']);
                Route::put('/shopping-lists/{shoppingList}/items/{item}', [NamedShoppingListController::class, 'toggleItem']);
                Route::delete('/shopping-lists/{shoppingList}/items/{item}', [NamedShoppingListController::class, 'removeItem']);

                // Tasks
                Route::get('/tasks/calendar/{year}/{month}', [TaskController::class, 'calendar']);
                Route::apiResource('tasks', TaskController::class);

                // Task Completions
                Route::get('/tasks/{task}/completions', [TaskCompletionController::class, 'index']);
                Route::post('/tasks/{task}/complete', [TaskCompletionController::class, 'store']);
                Route::delete('/tasks/{task}/complete/{date}', [TaskCompletionController::class, 'destroy']);
            });

        // Sync endpoints
        Route::post('/sync/push', [SyncController::class, 'push']);
        Route::get('/sync/pull', [SyncController::class, 'pull']);
    });
});
