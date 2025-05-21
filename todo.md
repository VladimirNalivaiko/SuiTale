# SuiTale Refactoring Plan

## Phase 0: Preparations
- [x] User confirmed their backend service wallet was funded.
- [x] User confirmed `PLATFORM_WALLET_ADDRESS` environment variable was set.

## Phase 1: Backend Refactoring
- [x] **`SuiService` (`src/backend/modules/sui/services/sui.service.ts`)**:
    - [x] Create `buildPublishTaleTemplateTransactionBlock` method.
    - [x] Keep existing `publishTaleTemplate` method.
- [x] **`TalesService` (`src/backend/modules/tales/services/tales.service.ts`)**:
    - [x] Rename `initiatePublication` to `prepareTalePublication` and update logic.
    - [x] Create `recordTalePublication` method.
- [x] **`Tale` schema (`src/backend/modules/tales/schemas/tale.schema.ts`)**:
    - [x] Update for `suiObjectId` and `suiTxDigest`.
- [x] **`mapToTaleSummary` helper**:
    - [x] Update as needed.
- [x] **`TalesController` (`src/backend/modules/tales/controllers/tales.controller.ts`)**:
    - [x] Create `RecordPublicationDto` and `PreparePublicationResultDto` (backend DTOs).
    - [x] Rename `POST /api/tales/initiate-publication` to `POST /api/tales/prepare-publication`.
    - [x] Create new endpoint `POST /api/tales/record-publication`.
    - [x] Modify `POST /api/tales/upload/cover` endpoint.
- [x] **`WalrusService` (`src/backend/modules/walrus/services/walrus.service.ts`)**:
    - [x] Confirm methods use backend's service key.

## Phase 2: Frontend Refactoring
- [x] **API Client (`src/frontend/api/tales.api.ts`)**:
    - [x] Add `preparePublication` and `recordPublication` functions.
    - [x] Add/Update DTOs: `FrontendInitiatePublicationDto`, `PreparePublicationResultDto`, `RecordPublicationDto`.
        - [x] Ensure `FrontendInitiatePublicationDto` uses `number` for `mintPrice` and `mintCapacity`, and correct `authorAddress`.
- [ ] **React Query Hooks (`src/frontend/hooks/useTales.ts`, `src/frontend/hooks/useFiles.ts`)**:
    - [x] `useUploadCoverToWalrus` hook (in `useFiles.ts`) confirmed.
    - [ ] Create `usePreparePublication` hook (or ensure `useInitiatePublication` is correctly adapted and renamed).
    - [ ] Create `useRecordPublication` hook.
- [ ] **`CreateTalePage.tsx`**:
    - [x] Cover Upload Logic:
        - [x] `coverImageFile` state (now handled directly in `handleCoverUpload` and `uploadCoverToWalrus`).
        - [x] `handleCoverUpload` logic for local preview and storing file.
        - [x] Upload to Walrus in `handlePublish` before `preparePublication`. (User has refactored `handleCoverUpload` to upload immediately).
    - [ ] Main Publication Logic (`handlePublish`):
        - [ ] Use `usePreparePublication` and `useRecordPublication` (or direct API calls if hooks are not fully implemented for both yet).
        - [x] Mint Price: Convert `mintPriceInSui` (string, user input) to MIST (number) before sending to backend.
        - [x] Assemble `FrontendInitiatePublicationDto`.
        - [x] Call `preparePublicationMutate` (or `talesApi.preparePublication`).
        - [x] Deserialize `transactionBlockBytes`.
        - [x] Call `signAndExecuteTransaction`.
        - [x] Call `recordPublicationMutate` (or `talesApi.recordPublication`).
        - [x] Success/error handling, form reset.
    - [x] UI Structure and Styling:
        - [x] `MetadataPanel.tsx` as right-hand sidebar.
        - [x] `CoverImageUpload` removed from `MetadataPanel` and placed on `CreateTalePage` (User moved cover upload functionality into `MetadataPanel` in their recent changes).
        - [x] `CreateTalePage.tsx` main layout (EditorHeader, Title, Editor, NodeMenu).
    - [ ] Debug/Finalize `SlashTip` functionality.
    - [ ] Ensure `NodeMenu` is positioned correctly as a static block.
    - [ ] Resolve all Linter errors.

## Phase 3: Testing and Finalization
- [ ] Thoroughly test the entire publication flow (user pays for tx, platform pays for Walrus).
- [ ] Test cover upload.
- [ ] Test edge cases and error handling.
- [ ] Code cleanup and final review.

## Current Focus / Next Steps (based on last known state before interruption):
- [ ] Add `useRecordPublication` hook in `src/frontend/hooks/useTales.ts`.
- [ ] Add `usePreparePublication` hook (or rename/refactor `useInitiatePublication`) in `src/frontend/hooks/useTales.ts`.
- [ ] Update `CreateTalePage.tsx` to use these hooks correctly.
- [ ] Fix remaining linter errors in `CreateTalePage.tsx`, especially those related to:
    - Incorrect `signAndExecuteTransaction` parameters (e.g., `transactionBlock` vs `transaction`).
    - Props validation for `EditorHeader`, `MetadataPanel`, `SlashTip`, `PreviewDialog`.
    - Type issues with `editorContentStyles`.
    - Implicit `any` types in event handlers.
- [ ] Review recent user changes to `CreateTalePage.tsx` to ensure alignment with the overall refactoring goals (e.g. cover upload in `MetadataPanel`, `mintPrice` direct MIST state). 