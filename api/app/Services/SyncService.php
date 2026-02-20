<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Task;
use App\Models\TaskCompletion;
use App\Models\User;

class SyncService
{
    public function processPush(array $data, int $householdId, User $user): array
    {
        $idMappings = [];

        if (!empty($data['products'])) {
            foreach ($data['products'] as $item) {
                $mapping = $this->processProductSync($item, $householdId, $user);
                if ($mapping) {
                    $idMappings[] = $mapping;
                }
            }
        }

        if (!empty($data['tasks'])) {
            foreach ($data['tasks'] as $item) {
                $mapping = $this->processTaskSync($item, $householdId, $user);
                if ($mapping) {
                    $idMappings[] = $mapping;
                }
            }
        }

        if (!empty($data['task_completions'])) {
            foreach ($data['task_completions'] as $item) {
                $this->processTaskCompletionSync($item, $user);
            }
        }

        return ['id_mappings' => $idMappings];
    }

    private function processProductSync(array $item, int $householdId, User $user): ?array
    {
        $uuid = $item['uuid'];
        $action = $item['action'];
        $data = $item['data'] ?? [];

        if ($action === 'delete') {
            Product::where('uuid', $uuid)->delete();
            return null;
        }

        $existing = Product::withTrashed()->where('uuid', $uuid)->first();

        if ($existing) {
            $existing->update($data);
            return null;
        }

        $product = Product::create(array_merge($data, [
            'uuid' => $uuid,
            'household_id' => $householdId,
            'created_by' => $user->id,
        ]));

        return ['uuid' => $uuid, 'server_id' => $product->id, 'type' => 'product'];
    }

    private function processTaskSync(array $item, int $householdId, User $user): ?array
    {
        $uuid = $item['uuid'];
        $action = $item['action'];
        $data = $item['data'] ?? [];

        if ($action === 'delete') {
            Task::where('uuid', $uuid)->delete();
            return null;
        }

        $existing = Task::withTrashed()->where('uuid', $uuid)->first();

        if ($existing) {
            $existing->update($data);
            return null;
        }

        $task = Task::create(array_merge($data, [
            'uuid' => $uuid,
            'household_id' => $householdId,
            'created_by' => $user->id,
        ]));

        return ['uuid' => $uuid, 'server_id' => $task->id, 'type' => 'task'];
    }

    private function processTaskCompletionSync(array $item, User $user): void
    {
        $uuid = $item['uuid'];
        $data = $item['data'] ?? [];

        $existing = TaskCompletion::where('uuid', $uuid)->first();
        if ($existing) return;

        TaskCompletion::create(array_merge($data, [
            'uuid' => $uuid,
            'completed_by' => $user->id,
        ]));
    }
}
