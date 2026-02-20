<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'min_quantity' => ['sometimes', 'integer', 'min:0'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'expiry_date' => ['nullable', 'date'],
            'is_reusable' => ['boolean'],
            'restock_interval_days' => ['nullable', 'integer', 'min:1'],
            'barcode' => ['nullable', 'string', 'max:255'],
            'on_shopping_list' => ['boolean'],
        ];
    }
}
