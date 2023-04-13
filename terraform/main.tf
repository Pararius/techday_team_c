terraform {
  required_version = ">= 1.0.0"

  backend "gcs" {
    bucket = "techday-teamc-tfstate"
    prefix = "main"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.google_cloud_project_id
  region  = var.google_cloud_default_region
  zone    = var.google_cloud_default_zone
}

resource "google_storage_bucket" "code-bucket" {
  name     = "techday-teamc-codebucket"
  location = var.google_cloud_default_region
}

data "archive_file" "descr-to-json-source" {
  type        = "zip"
  output_path = "/tmp/techday/archive.zip"

  dynamic "source" {
    for_each = toset([
      "../src/description-to-json/main.py",
      "../src/description-to-json/requirements.txt"
    ])
    content {
      content  = file(abspath(source.value))
      filename = basename(source.value)
    }
  }
}

resource "google_storage_bucket_object" "descr-to-json-archive" {
  name   = "archive.zip"
  bucket = google_storage_bucket.code-bucket.name
  source = data.archive_file.descr-to-json-source.output_path
}

resource "google_cloudfunctions_function" "descr-to-json-function" {
  name        = "description-to-json"
  description = "Extract info from description using GPT"
  runtime     = "python310"

  available_memory_mb   = 512
  source_archive_bucket = google_storage_bucket.code-bucket.name
  source_archive_object = google_storage_bucket_object.descr-to-json-archive.name
  trigger_http          = true
  entry_point           = "handler"
}

# IAM entry for all users to invoke the function
resource "google_cloudfunctions_function_iam_member" "invoker" {
  project        = var.google_cloud_project_id
  region         = var.google_cloud_default_region
  cloud_function = google_cloudfunctions_function.descr-to-json-function.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
}
