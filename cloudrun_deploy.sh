#!/bin/bash

# Cloud Run deployment script for Dogtor AI Backend
set -e

PROJECT_ID=${PROJECT_ID:-"your-gcp-project-id"}
SERVICE_NAME=${SERVICE_NAME:-"dogtor-api"}
REGION=${REGION:-"us-central1"}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying Dogtor AI Backend to Cloud Run"
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"

# Build and push Docker image
echo "📦 Building Docker image..."
cd backend
docker build -t ${IMAGE_NAME} .

echo "🔄 Pushing to Google Container Registry..."
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image=${IMAGE_NAME} \
    --platform=managed \
    --region=${REGION} \
    --allow-unauthenticated \
    --port=8000 \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --timeout=300 \
    --concurrency=80 \
    --set-env-vars="ENV=prod" \
    --set-env-vars="STORAGE_BACKEND=supabase" \
    --set-env-vars="MAX_IMAGE_MB=5" \
    --set-env-vars="API_CORS_ORIGINS=https://hellodogtor.com,https://hellodogtor.vercel.app" \
    --set-env-vars="DB_URL=${DB_URL}" \
    --set-env-vars="SUPABASE_URL=${SUPABASE_URL}" \
    --set-env-vars="SUPABASE_SERVICE_ROLE=${SUPABASE_SERVICE_ROLE}" \
    --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY}" \
    --set-env-vars="OPENAI_API_KEY=${OPENAI_API_KEY}" \
    --project=${PROJECT_ID}

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)' --project=${PROJECT_ID})

echo "✅ Deployment complete!"
echo "🌍 Service URL: ${SERVICE_URL}"
echo ""
echo "📋 Next steps:"
echo "1. Update your frontend VITE_API_URL to: ${SERVICE_URL}/api"
echo "2. Add ${SERVICE_URL} to your Supabase CORS origins"
echo "3. Update your Vercel environment variables"
echo ""
echo "🔧 To update environment variables later:"
echo "gcloud run services update ${SERVICE_NAME} --region=${REGION} --set-env-vars=KEY=VALUE --project=${PROJECT_ID}"

cd ..
