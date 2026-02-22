# HouseKeep — Dokumentacja funkcji

> Plik wygenerowany automatycznie. Zawiera: listę funkcji z linkami do kodu, analizę DRY/SOLID, propozycje refactoru oraz plan 7 nowych funkcji.

---

## Spis treści
1. [Obecne funkcje](#1-obecne-funkcje)
2. [Analiza DRY / SOLID](#2-analiza-dry--solid)
3. [Propozycje refactoru](#3-propozycje-refactoru)
4. [Nowe funkcje (roadmap)](#4-nowe-funkcje-roadmap)

---

## 1. Obecne funkcje

### 1.1 Uwierzytelnianie
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| Rejestracja | `api/routes/api.php:20` | `mobile/app/(auth)/register.tsx` |
| Logowanie | `api/routes/api.php:21` | `mobile/app/(auth)/login.tsx` |
| Wylogowanie | `api/app/Http/Controllers/Api/V1/AuthController.php` | `mobile/src/stores/authStore.ts` |
| Tokeny Sanctum | `api/routes/api.php:25` (middleware) | `mobile/src/api/client.ts` |

### 1.2 Zarządzanie gospodarstwem
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| Tworzenie/podgląd | `api/app/Http/Controllers/Api/V1/HouseholdController.php` | `mobile/app/(app)/(tabs)/settings/index.tsx` |
| Zapraszanie członków (kod / email) | `api/routes/api.php:35-44` | `mobile/src/hooks/useHousehold.ts:89-98` |
| Lista członków | `api/routes/api.php:37` | `mobile/src/hooks/useHousehold.ts:16-23` |

### 1.3 Produkty (magazyn)
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| Lista z filtrowaniem (lokalizacja, kategoria, fraza) | `api/app/Http/Controllers/Api/V1/ProductController.php:16-42` | `mobile/app/(app)/(tabs)/products/index.tsx:14-18` |
| Dodawanie produktu | `api/app/Http/Controllers/Api/V1/ProductController.php:44-61` | `mobile/app/(app)/(tabs)/products/add.tsx:85-109` |
| Edycja produktu | `api/app/Http/Controllers/Api/V1/ProductController.php:70-86` | `mobile/app/(app)/(tabs)/products/edit.tsx:105-129` |
| Szczegóły produktu | `api/app/Http/Controllers/Api/V1/ProductController.php:63-68` | `mobile/app/(app)/(tabs)/products/[id].tsx` |
| Usuwanie produktu | `api/app/Http/Controllers/Api/V1/ProductController.php:88-93` | `mobile/app/(app)/(tabs)/products/[id].tsx` |
| Uzupełnianie stanu (restock) | `api/app/Http/Controllers/Api/V1/ProductController.php:124-150` | `mobile/app/(app)/(tabs)/products/[id].tsx` |
| Historia cen | `api/routes/api.php:72-76` | `mobile/src/api/products.ts:31-35` |
| Produkty wygasające | `api/app/Http/Controllers/Api/V1/ProductController.php:95-109` | `mobile/src/hooks/useProducts.ts:24-31` |
| Produkty o niskim stanie | `api/app/Http/Controllers/Api/V1/ProductController.php:111-122` | `mobile/src/hooks/useProducts.ts:33-40` |
| Filtr chipów — lokalizacja | `mobile/app/(app)/(tabs)/products/index.tsx:68-84` | — |

### 1.4 Skaner kodów kreskowych
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| Lookup barcode (OpenFoodFacts) | `api/app/Http/Controllers/Api/V1/BarcodeController.php:16-35` | `mobile/src/api/barcode.ts` |
| OpenFoodFacts service | `api/app/Services/OpenFoodFactsService.php` | — |
| Skaner (web) — BarcodeDetector API + @zxing/library fallback | — | `mobile/src/components/BarcodeScannerView.web.tsx` |
| Skaner (native) — expo-camera | — | `mobile/src/components/BarcodeScannerView.tsx` |
| Modal skanera | — | `mobile/src/components/BarcodeScannerModal.tsx` |
| Toast feedback (info / sukces / błąd) | — | `mobile/app/(app)/(tabs)/products/add.tsx:11-23` |

### 1.5 Lokalizacje i kategorie
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| CRUD lokalizacji | `api/app/Http/Controllers/Api/V1/LocationController.php` | `mobile/app/(app)/(tabs)/settings/locations.tsx` |
| CRUD kategorii | `api/app/Http/Controllers/Api/V1/CategoryController.php` | `mobile/app/(app)/(tabs)/settings/categories.tsx` |
| Hook lokalizacji | — | `mobile/src/hooks/useHousehold.ts:25-32` |
| Hook kategorii | — | `mobile/src/hooks/useHousehold.ts:34-41` |

### 1.6 Zadania (Tasks)
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| CRUD zadań | `api/app/Http/Controllers/Api/V1/TaskController.php` | `mobile/app/(app)/(tabs)/tasks/` |
| Widok kalendarza | `api/app/Http/Controllers/Api/V1/TaskController.php:83-120` | `mobile/app/(app)/(tabs)/tasks/calendar.tsx` |
| Zadania cykliczne (rrule) | `api/app/Services/RecurrenceService.php` | `mobile/app/(app)/(tabs)/tasks/add.tsx` |
| Oznaczanie jako ukończone | `api/app/Http/Controllers/Api/V1/TaskController.php:59-74` | `mobile/src/hooks/useTasks.ts:70-81` |
| Przypisywanie do użytkownika | `api/app/Http/Controllers/Api/V1/TaskController.php:41-50` | `mobile/app/(app)/(tabs)/tasks/add.tsx` |

### 1.7 Lista zakupów
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| Podgląd listy | `api/app/Http/Controllers/Api/V1/ShoppingListController.php:18-25` | `mobile/app/(app)/(tabs)/shopping/index.tsx` |
| Auto-generowanie listy | `api/app/Http/Controllers/Api/V1/ShoppingListController.php:27-36` | `mobile/app/(app)/(tabs)/shopping/index.tsx` |
| Toggle pozycji | `api/app/Http/Controllers/Api/V1/ShoppingListController.php:38-45` | `mobile/src/hooks/useShopping.ts:26-35` |
| ShoppingListService | `api/app/Services/ShoppingListService.php` | — |

### 1.8 Powiadomienia push
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| Alerty wygaśnięcia | `api/app/Jobs/SendExpiryAlerts.php` | — |
| Przypomnienia o zadaniach | `api/app/Jobs/SendTaskReminders.php` | — |
| Alerty niskiego stanu | `api/app/Jobs/SendLowStockAlerts.php` | — |
| Scheduler (cron co minutę) | `api/app/Console/Kernel.php` | — |
| Web Push (VAPID) | `api/app/Services/PushNotificationService.php` | `mobile/src/hooks/useWebPush.ts` + `mobile/public/sw.js` |
| Expo Push (natywny APK) | `api/app/Services/PushNotificationService.php` | `mobile/src/hooks/usePushNotifications.ts` |

### 1.9 Synchronizacja offline (backend ready)
| Funkcja | Backend | Frontend |
|---------|---------|----------|
| Push sync (klient → serwer) | `api/app/Services/SyncService.php:12-41` | — |
| Pull sync (serwer → klient) | `api/app/Http/Controllers/Api/V1/SyncController.php` | — |
| UUID-based entities | Wszystkie modele mają pole `uuid` | `mobile/src/types/models.ts` |

---

## 2. Analiza DRY / SOLID

### 2.1 Backend — naruszenia DRY

#### Problem A: CategoryController ≈ LocationController (⚠️ Wysoki priorytet)
Oba kontrolery mają **identyczną strukturę 70 linii**. Różnią się wyłącznie:
- Polem sortowania: `name` vs `sort_order`
- Dodatkowym polem: `color` (Category) vs `sort_order` (Location)

```
api/app/Http/Controllers/Api/V1/CategoryController.php:14-68
api/app/Http/Controllers/Api/V1/LocationController.php:14-68
```

Wzorzec duplikacji w każdym:
```php
// index()
return Resource::collection(
    Model::household()->withCount('products')->orderBy(FIELD)->get()
);
// store()
$validated = $request->validate([...]);
$model = Model::create(array_merge($validated, ['household_id' => ...]));
return new Resource($model);
// update()
$model->update($request->validate([...]));
// destroy()
$model->delete(); return response()->noContent();
```

**Rozwiązanie**: Abstrakcyjny trait `HasSimpleCrud` lub wspólny `BaseSimpleResourceController`.

---

#### Problem B: 3 klasy Job — 80% duplikacji (⚠️ Wysoki priorytet)
```
api/app/Jobs/SendExpiryAlerts.php:14-44
api/app/Jobs/SendTaskReminders.php:16-52
api/app/Jobs/SendLowStockAlerts.php:14-38
```

Każda klasa powtarza ten sam wzorzec:
```php
$items = Model::with('household.members')->where(...)->get();
foreach ($items as $item) {
    $userIds = $item->household->members->pluck('id')->toArray();
    if (empty($userIds)) continue;
    $pushService->sendToUsers($userIds, ['type' => TYPE, ...]);
}
```

**Rozwiązanie**: Abstrakcyjna klasa `BaseAlertJob` z metodą `getItems()` do nadpisania w podklasach.

---

#### Problem C: SyncService::processProductSync ≈ processTaskSync (⚠️ Średni priorytet)
```
api/app/Services/SyncService.php:43-68  (processProductSync)
api/app/Services/SyncService.php:70-95  (processTaskSync)
```

Obie metody mają identyczny algorytm UUID-sync:
```php
$uuid = $item['uuid']; $action = $item['action'];
if ($action === 'delete') { Model::where('uuid', $uuid)->delete(); return null; }
$existing = Model::withTrashed()->where('uuid', $uuid)->first();
if ($existing) { $existing->update($data); return null; }
Model::create(array_merge($data, ['uuid' => $uuid, 'household_id' => $householdId]));
return ['uuid' => $uuid, 'server_id' => ..., 'type' => '...'];
```

**Rozwiązanie**: Generyczna metoda `processEntitySync(string $modelClass, array $item, int $householdId, User $user)`.

---

### 2.2 Frontend — naruszenia DRY

#### Problem D: categories.ts ≈ locations.ts — 100% identyczne (⚠️ Średni priorytet)
```
mobile/src/api/categories.ts:4-16
mobile/src/api/locations.ts:4-16
```

Oba pliki to dosłownie ten sam kod z podmienioną nazwą zasobu:
```typescript
export const categoriesApi = {
  list: (householdId: number) => api.get<...>(`/households/${householdId}/categories`),
  create: (householdId: number, data: Partial<Category>) => api.post(...),
  update: (...) => api.put(...),
  delete: (...) => api.delete(...),
};
```

**Rozwiązanie**: Factory `createSimpleApiClient<T>(resource: string)` → wywołanie:
```typescript
export const categoriesApi = createSimpleApiClient<Category>('categories');
export const locationsApi = createSimpleApiClient<Location>('locations');
```

---

#### Problem E: Hook factory pattern ×4 — 85% duplikacji (⚠️ Średni priorytet)
```
mobile/src/hooks/useProducts.ts:6-12   (useProducts)
mobile/src/hooks/useTasks.ts:6-13      (useTasks)
mobile/src/hooks/useShopping.ts:5-12   (useShoppingList)
mobile/src/hooks/useHousehold.ts:25-41 (useLocations, useCategories)
```

Każdy hook:
```typescript
export function useEntity(params?: Params) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['entity', householdId, params],
    queryFn: () => api.list(householdId!, params),
    enabled: !!householdId,
  });
}
```

**Rozwiązanie**: Generic factory:
```typescript
function createListHook<T, P>(key: string, apiFn: (id: number, p?: P) => Promise<T>) {
  return (params?: P) => {
    const householdId = useAuthStore((s) => s.activeHouseholdId);
    return useQuery({ queryKey: [key, householdId, params], queryFn: () => apiFn(householdId!, params), enabled: !!householdId });
  };
}
```

---

#### Problem F: add.tsx ≈ edit.tsx — 90% duplikacji (⚠️ Niski priorytet)
```
mobile/app/(app)/(tabs)/products/add.tsx   (239 linii)
mobile/app/(app)/(tabs)/products/edit.tsx  (258 linii)
```

Oba pliki zawierają identyczne:
- Komponent `Toast` (linie 11-23 w obu)
- `showToast()` (linie 53-59 / 73-79)
- `handleBarcodeScanned()` (linie 61-83 / 81-103)
- Wszystkie style (linie 216-239 / 235-258)
- Cały formularz JSX

Różnią się tylko: inicjalnymi wartościami stanu, `mutateAsync` (create vs update), tytułem przycisku.

**Rozwiązanie**: Wspólny komponent `ProductForm` z prop `mode: 'add' | 'edit'`.

---

### 2.3 SOLID — ocena

| Zasada | Ocena | Komentarz |
|--------|-------|-----------|
| **S** — Single Responsibility | ✅ Dobra | Kontrolery, serwisy, joby mają jasne odpowiedzialności |
| **O** — Open/Closed | ⚠️ Częściowa | Job klasy wymagają modyfikacji zamiast rozszerzenia |
| **L** — Liskov Substitution | ✅ Dobra | Brak hierarchii klas wymagających sprawdzenia |
| **I** — Interface Segregation | ✅ Dobra | API klienty mają minimalne interfejsy |
| **D** — Dependency Inversion | ✅ Dobra | PushNotificationService wstrzykiwany przez DI w Laravelu |

---

## 3. Propozycje refactoru

### Priorytety

| # | Zmiana | Redukcja kodu | Trudność |
|---|--------|---------------|----------|
| 1 | `BaseAlertJob` dla 3 klas Job | −80 linii backendu | Łatwa |
| 2 | Generyczna `processEntitySync()` w SyncService | −30 linii | Łatwa |
| 3 | `createSimpleApiClient` factory (TS) | −17 linii TS | Łatwa |
| 4 | Generic hook factory | −60 linii TS | Średnia |
| 5 | `BaseSimpleResourceController` trait | −70 linii PHP | Średnia |
| 6 | Wspólny `ProductForm` komponent | −200 linii TSX | Trudna |

---

## 4. Nowe funkcje (roadmap)

### Feature 1: Date Picker dla daty ważności
**Status**: Do implementacji
**Cel**: Zamienić ręczne wpisywanie `YYYY-MM-DD` na natywny picker.

- **Web**: `<input type="date">` przez `Platform.OS === 'web'`
- **Native**: `@react-native-community/datetimepicker`

**Pliki**:
- `mobile/src/components/DatePickerInput.tsx` (nowy komponent)
- `mobile/app/(app)/(tabs)/products/add.tsx` — zastąpić TextInput w polu `expiryDate`
- `mobile/app/(app)/(tabs)/products/edit.tsx` — j.w.

---

### Feature 2: Filtr po kategorii na liście produktów
**Status**: Do implementacji
**Cel**: Dodać drugi rząd chipów kategorii pod chipami lokalizacji.

- Stan `selectedCategoryId` już istnieje w `products/index.tsx:12`
- Hook przekazuje `category_id` do API już w `products/index.tsx:17`
- Brakuje tylko UI: drugi `FlatList` z chipami kategorii

**Pliki**:
- `mobile/app/(app)/(tabs)/products/index.tsx` — dodać ~15 linii

---

### Feature 3: Statystyki / wykresy wydatków
**Status**: Do implementacji
**Cel**: Nowa zakładka "Statystyki" z sumą wydatków i wykresem miesięcznym.

**Zależności**: `react-native-chart-kit`, `react-native-svg`

**Pliki**:
- `mobile/app/(app)/(tabs)/stats/index.tsx` (nowy ekran)
- `mobile/app/(app)/(tabs)/_layout.tsx` — dodać tab 📊
- `mobile/src/api/stats.ts` — endpoint price-history

---

### Feature 4: Ciemny motyw
**Status**: Do implementacji (największa zmiana)
**Cel**: Przełącznik jasny/ciemny z zapisem preferencji.

**Pliki**:
- `mobile/src/constants/colors.ts` — dodać `darkColors`
- `mobile/src/stores/themeStore.ts` (nowy Zustand store z persist)
- ~27 ekranów i komponentów — wymiana hardkodowanych kolorów

---

### Feature 5: Eksport danych CSV
**Status**: Do implementacji
**Cel**: Eksport listy produktów do pliku CSV.

- **Native**: `expo-sharing` + `expo-file-system`
- **Web**: `Blob` download przez `<a>` element

**Pliki**:
- `mobile/src/utils/exportCsv.ts` (nowy util)
- `mobile/app/(app)/(tabs)/products/index.tsx` — przycisk w nagłówku

---

### Feature 6: Wiele list zakupów
**Status**: Do implementacji (backend + frontend)
**Cel**: Nazwane listy zakupów (np. "Biedronka", "Lidl", "Apteka").

**Backend**:
- Nowa migracja: tabela `shopping_lists` z `id`, `name`, `household_id`
- Refactor `ShoppingListController` i `ShoppingListService`

**Frontend**:
- `mobile/app/(app)/(tabs)/shopping/index.tsx` — wybór aktywnej listy
- Nowy ekran zarządzania listami

---

### Feature 7: Zdjęcia produktów z OpenFoodFacts
**Status**: Do implementacji
**Cel**: Wyświetlać zdjęcia produktów pobrane przy skanowaniu.

**Backend**:
- Nowa migracja: `add_image_url_to_products_table`
- `ProductController::store/update` — obsługa pola `image_url`
- `BarcodeController` już zwraca `image_url` (line 28)

**Frontend**:
- `mobile/app/(app)/(tabs)/products/[id].tsx` — wyświetlić zdjęcie
- `mobile/app/(app)/(tabs)/products/add.tsx` — po skan: `setImageUrl(...)`
- `mobile/app/(app)/(tabs)/products/edit.tsx` — j.w.
