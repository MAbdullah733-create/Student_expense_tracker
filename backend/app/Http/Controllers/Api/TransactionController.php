<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->transactions()->with('category');

        if ($request->has('month')) {
            $month = $request->input('month');
            $query->whereYear('date', substr($month, 0, 4))
                ->whereMonth('date', substr($month, 5, 2));
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        $transactions = $query->orderByDesc('date')->orderByDesc('id')->get();

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $category = $request->user()->categories()->find($validated['category_id']);
        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $transaction = $request->user()->transactions()->create($validated);
        $transaction->load('category');

        return response()->json($transaction, 201);
    }

    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(404);
        }
        $transaction->load('category');
        return response()->json($transaction);
    }

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'date' => ['sometimes', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        if (isset($validated['category_id'])) {
            $category = $request->user()->categories()->find($validated['category_id']);
            if (! $category) {
                return response()->json(['message' => 'Category not found'], 404);
            }
        }

        $transaction->update($validated);
        $transaction->load('category');

        return response()->json($transaction);
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(404);
        }

        $transaction->delete();

        return response()->json(null, 204);
    }

    public function summary(Request $request): JsonResponse
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $totalThisMonth = $request->user()
            ->transactions()
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $byCategory = $request->user()
            ->transactions()
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name,color')
            ->get()
            ->map(function ($row) {
                return [
                    'category_id' => $row->category_id,
                    'category_name' => $row->category?->name,
                    'color' => $row->category?->color,
                    'total' => (float) $row->total,
                ];
            });

        $recent = $request->user()
            ->transactions()
            ->with('category')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        return response()->json([
            'total_this_month' => (float) $totalThisMonth,
            'by_category' => $byCategory,
            'recent_transactions' => $recent,
        ]);
    }
}
