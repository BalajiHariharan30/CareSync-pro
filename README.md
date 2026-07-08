# CareSync Pro - AI-Powered Doctor Appointment & Screening System

Welcome to **CareSync Pro**, a modern, full-stack healthcare platform integrated with a self-contained AI-powered chest X-ray screening module for Pneumonia detection.

---

## AI Disease Prediction (Pneumonia Detection)

We have added a standalone AI health screening feature. This allows patients to upload their chest X-ray scans and receive instantaneous, proof-of-concept AI-based classification.

### Model Selection & Architecture
- **Model Chosen:** `nickmuchi/vit-finetuned-chest-xray-pneumonia` (Hugging Face)
- **Model Type:** Vision Transformer (ViT) fine-tuned specifically on Chest X-ray images.
- **Why this model was chosen:**
  1. **High Accuracy:** Vision Transformers (ViT) capture global image dependencies far better than standard CNNs, yielding superior classification accuracy for medical images.
  2. **Ease of Inference:** It utilizes Hugging Face's pipeline API, allowing rapid out-of-the-box predictions without complex pre-processing code.
  3. **No Training/No Costs:** Runs completely locally and uses a free, open-source model.

### Dataset & Resources Used
- The model is fine-tuned on the standard **Chest X-Ray Images (Pneumonia)** dataset, which contains 5,856 validated JPEG chest X-ray images from pediatric patients.
- Implemented using Python's `transformers` library alongside `torch` and `pillow`.

### Limitations & Assumptions
- **Disclaimer:** The screening tool is a proof-of-concept AI model. It does NOT provide clinical diagnoses and is not a substitute for professional medical consultations.
- **Image Requirements:** Images must be chest X-ray scans (anterior-posterior views) for meaningful predictions. Uploading unrelated images will produce unreliable labels.

---

## Strict Feature Isolation

This AI Prediction module is built in complete isolation from the existing appointment booking flow:

1. **Database Isolation:** All AI prediction records are saved inside a new mongoose model/collection `AiPrediction` (`ai_predictions`). No modifications were made to the existing `appointments` or `users` models.
2. **API Isolation:** All endpoints reside under `POST/GET /api/ai-prediction/*`.
3. **Backend Isolation:** All new logic runs in `backend/ai-prediction/`.
4. **Frontend Isolation:** All React pages, views, and styles reside under `frontend/src/ai-prediction/`.
5. **Untouched Booking Flow:** The booking controller (`appointmentController.js`), routes (`appointmentRoutes.js`), and schema (`Appointment.js`) remain 100% untouched.

---

## Technical Stack
- **Frontend:** React, React Router Dom, Axios, CSS (Glassmorphism)
- **Backend:** Node.js, Express, Mongoose, Multer, Python `child_process`
- **Database:** MongoDB
- **AI Core:** Hugging Face `transformers` pipeline, PyTorch
