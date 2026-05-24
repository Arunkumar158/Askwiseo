# Migration from ChromaDB to Pinecone

## Goal Description
Migrate the vector store layer of the Askwiseo backend from the local ChromaDB implementation to Pinecone while preserving all existing API contracts, PDF upload flow, embeddings, chat retrieval, citation system, and user isolation. Add robust error handling, environment validation, and startup checks. Ensure a safe rollout with a migration strategy that does not delete the existing Chroma data until Pinecone is verified.

## User Review Required
- **Pinecone Credentials**: Provide `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, and `PINECONE_ENVIRONMENT` in the `.env` file.
- **Embedding Dimension**: Confirm the dimensionality of the current embedding model matches the Pinecone index dimension.
- **Namespace Isolation**: Using `firebase_user_id` as namespace must meet multi‑tenant security requirements.
- **Legacy Cleanup**: Decide when to delete the `chroma_db` directory and remove Chroma from `requirements.txt`.

## Open Questions
- Re-index existing documents from Chroma to Pinecone now or later?
- Keep a fallback to Chroma during transition?
- Desired behavior for empty Pinecone results?
- Preferred logging/monitoring for Pinecone errors?

## Proposed Changes
### backend/services
- **vector_store.py**: Replace Chroma logic with Pinecone wrappers (`init_pinecone`, `upsert_vectors`, `query_vectors`, `delete_by_document`). Add namespace handling.
- **pinecone_service.py** (new): Encapsulate Pinecone SDK initialization, index creation, and CRUD operations. Use async‑compatible functions.
- **ai_service.py**: Import Pinecone functions, ensure `generate_answer` passes `user_id` as namespace, improve empty‑result handling.
- **upload.py**: After document metadata creation, call Pinecone upsert.
- **documents.py**: Use Pinecone delete on document removal.
- **config.py**: Add env vars `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `PINECONE_ENVIRONMENT` with validation.
### backend
- **requirements.txt**: Add `pinecone-client` and remove `chromadb`.
- **.env.example**: Include placeholders for Pinecone vars.
- **main.py**: On startup, validate Pinecone connection, ensure index exists (create if missing), log health.
### Migration Strategy
- Optional `migration.py` script to copy existing Chroma vectors into Pinecone per user namespace.
- Feature flag to switch retrieval from Chroma to Pinecone gradually.
### Error Handling
- Wrap Pinecone calls in try/except, raise `HTTPException` with clean JSON errors.
- Central logging of connection failures.
## Verification Plan
- Update unit tests to mock Pinecone client.
- Integration test: upload PDF, query chat, verify citations and namespace isolation.
- Manual staging deployment test for multi‑user isolation.
- Ensure fallback behavior when Pinecone unavailable.

**Note**: All changes will be incremental with feature flags to avoid production impact.
