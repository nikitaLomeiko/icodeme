"use client";

import { withAccount, withAuth } from "@/app/providers/auth";
import { DocumentationStepPage } from "@/pages-root/study-step";

export default withAuth(withAccount(DocumentationStepPage));
