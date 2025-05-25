# TODO: Оптимизация процесса публикации Tale

## Текущие проблемы
- ❌ Бэкенд использует свой приватный ключ для Walrus операций
- ❌ Нет предварительного расчета стоимости для пользователя  
- ❌ Пользователь не знает заранее цену операций
- ❌ Cover image загружается после blockchain транзакции
- ❌ **Слишком много транзакций** (потенциально 7) - плохой UX

## Целевая архитектура (Single Batch Upload)
- ✅ **ОДНА транзакция** для всего контента (cover + content)
- ✅ **Два отдельных blob'а**: cover blob + content blob  
- ✅ **Sui NFT Standards**: совместимость с KIOSK из коробки
- ✅ **No immediate minting**: blob'ы готовы для mint'а когда угодно
- ✅ **Atomic operation**: всё или ничего

## UX vs Decentralization Trade-offs

### 🚨 **Проблема**: Полная децентрализация = плохой UX
**7 транзакций:**
- Cover: createStorage + registerBlob + certifyBlob  
- Content: createStorage + registerBlob + certifyBlob
- NFT: mint
- **Результат**: 70%+ отток пользователей

### 💡 **Решение**: Гибридный подход (2-3 транзакции)

#### **Архитектура A: Batch Upload (рекомендуется)** ⭐⭐⭐
```
1. Upload Bundle Transaction
   ├─ Cover Image (если есть)
   ├─ Content 
   └─ Все Walrus операции в одном batch
   
2. NFT Mint Transaction  
   └─ Создание NFT с ссылками на blob'ы

Background: certifyBlob operations (асинхронно)
```
**UX**: 2 подписи, ~2-3 минуты  
**Tech**: Требует batch smart contract

#### **Архитектура B: Minimal Hybrid (альтернатива)** ⭐⭐
```
1. Content Upload Transaction
   └─ registerBlob для контента (backend подготовил storage)
   
2. NFT Mint Transaction
   └─ Создание NFT + cover upload (если нужно)
```
**UX**: 2 подписи, ~1-2 минуты  
**Tech**: Backend делает больше preparation work

---

## Новый Business Flow

### **Frontend → Backend (один запрос):**
```typescript
POST /api/tales/prepare-publication
{
  title: string,
  description: string, 
  content: string,
  coverImage: File, // бинарные данные
  tags: string[],
  userAddress: string
}
```

### **Backend обработка:**
1. **Encode оба blob'а**: cover + content
2. **Calculate batch costs**: storage + gas для 2 blob'ов
3. **Create batch transaction**: все Walrus операции в одной транзакции
4. **Return**: стоимость + serialized transaction

### **Response:**
```typescript
{
  costs: {
    coverBlob: { wal: number, mist: string },
    contentBlob: { wal: number, mist: string },
    totalGas: { sui: number, mist: string },
    total: { 
      walTokens: number, 
      suiTokens: number,
      estimatedUSD?: number 
    }
  },
  transaction: string, // serialized batch transaction
  metadata: {
    coverBlobId: string,   // для preview
    contentBlobId: string, // для preview  
    estimatedTime: string  // "~30-60 seconds"
  }
}
```

### **User Experience:**
```
1. User: заполняет форму + выбирает cover
2. Click: "Estimate Publication Costs" 
3. Backend: показывает "Cover: 0.02 WAL, Content: 0.03 WAL, Gas: 0.1 SUI"
4. User: "Publish" → подписывает ОДНУ транзакцию
5. Done: content accessible, ready for NFT mint later
```

---

## Этап 1: Backend Implementation

### 1.1 Обновить эндпоинт
**Файл:** `src/backend/modules/tales/controllers/tales.controller.ts`
- [x] ~~POST /api/tales/estimate-costs~~ → **Объединить в prepare-publication**
- [ ] `POST /api/tales/prepare-publication` (заменяет текущий)
- [ ] Принимает: title + description + content + coverImage + userAddress
- [ ] Возвращает: costs + batchTransaction + metadata

### 1.2 Обновить WalrusService  
**Файл:** `src/backend/modules/walrus/services/walrus.service.ts`
- [ ] `prepareBatchUpload(userAddress, content, coverImage)`:
  - Encode cover → coverBlobId
  - Encode content → contentBlobId  
  - Create batch transaction (2 registerBlob calls)
  - Calculate total costs
  - Return serialized transaction + metadata

### 1.3 Обновить TalesService
**Файл:** `src/backend/modules/tales/services/tales.service.ts`
- [ ] `prepareTalePublication()`: новая логика batch upload
- [ ] `recordPublication()`: сохранять coverBlobId + contentBlobId отдельно
- [ ] Remove: старая логика upload'а cover image

---

## Этап 2: Frontend Updates

### 2.1 Обновить CreateTalePage
**Файл:** `src/frontend/pages/CreateTale/CreateTalePage.tsx`
- [ ] **Убрать отдельную загрузку cover**: нет `uploadCoverToWalrus`
- [ ] **Новый handlePublish()**: 
  ```typescript
  1. Validate form (включая cover image)
  2. Call preparePublication с cover + content
  3. Show cost breakdown  
  4. User confirms → sign ONE transaction
  5. Record publication in DB
  ```

### 2.2 Новый компонент Cost Preview
**Файл:** `src/frontend/components/TaleEditor/CostBreakdown.tsx`
- [ ] Показывает costs для cover blob + content blob
- [ ] Visual breakdown: "Cover Image: 0.02 WAL | Content: 0.03 WAL"
- [ ] Total cost с USD эквивалентом (если есть)
- [ ] Estimated time: "~30-60 seconds"

### 2.3 Обновить API типы
**Файл:** `src/frontend/api/tales.api.ts`
- [ ] Новый `PreparePublicationRequest` type
- [ ] Новый `PreparePublicationResponse` type
- [ ] Обновить hook: `usePreparePublication`

---

## Этап 3: Database Schema Updates

### 3.1 Tale model
**Файл:** `src/backend/modules/tales/schemas/tale.schema.ts`
- [ ] Добавить: `coverBlobId: string`
- [ ] Добавить: `contentBlobId: string`  
- [ ] Убрать: `walrusContentBlobId` (заменяется на contentBlobId)
- [ ] Обновить: `coverImageWalrusUrl` → URL builder из coverBlobId

### 3.2 Migration strategy
- [ ] Миграция существующих tale'ов
- [ ] Backward compatibility для старых URL'ов

---

## Этап 4: NFT Minting (Future)

### 4.1 Отложенный mint
- Tale сохраняется с `coverBlobId` + `contentBlobId`
- User может mint NFT позже через отдельный flow
- Поддержка KIOSK стандартов из коробки

### 4.2 Mint endpoints (будущее)
```typescript
POST /api/tales/:id/mint-nft
{
  userAddress: string,
  mintPrice?: string,
  royaltyFeeBps?: number
}
```

---

## Приоритизация (обновленная)

### 🔥 Sprint 1: Core Batch Upload
1. `WalrusService.prepareBatchUpload()` method
2. Updated `TalesController.preparePublication()` endpoint  
3. Frontend: single transaction flow

### 🚀 Sprint 2: UX Polish  
1. `CostBreakdown` component
2. Better error handling
3. Progress indicators

### 💫 Sprint 3: NFT Integration
1. Separate NFT minting flow
2. KIOSK compatibility
3. Marketplace integration

---

## Technical Benefits

### **Walrus Efficiency:**
- ✅ Batch operations faster than individual
- ✅ Less network overhead
- ✅ Atomic success/failure

### **Sui Standards:**
- ✅ Separate blob'ы = flexibility  
- ✅ KIOSK ready из коробки
- ✅ Future-proof для новых стандартов

### **User Experience:**
- ✅ 1 signature вместо multiple
- ✅ Clear cost preview
- ✅ Fast completion (~1 minute)

Этот подход намного лучше! Хотите начать с реализации `prepareBatchUpload()` метода? 🚀

## Этап 5: Testing & Deployment

### 5.1 Тестирование
- [ ] Unit тесты для новых хуков
- [ ] Integration тесты для full publication flow
- [ ] E2E тесты с реальными Sui wallet'ами
- [ ] Load testing для estimation эндпоинтов

### 5.2 Мониторинг
- [ ] Логирование каждого шага публикации
- [ ] Метрики: success rate, average time, failed steps
- [ ] Alerting при высоком проценте неудачных публикаций

---

## Notes
- Все изменения должны быть backward compatible
- Старый flow можно оставить как fallback
- Постепенная миграция пользователей на новый процесс
- A/B тестирование для сравнения conversion rates 