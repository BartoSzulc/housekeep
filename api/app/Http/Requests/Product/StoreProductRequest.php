<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['integer', 'min:0'],
            'min_quantity' => ['integer', 'min:0'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'expiry_date' => ['nullable', 'date'],
            'is_reusable' => ['boolean'],
            'restock_interval_days' => ['nullable', 'integer', 'min:1'],
            'barcode' => ['nullable', 'string', 'max:255'],
        ];
    }
}
