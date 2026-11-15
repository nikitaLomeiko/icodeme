"use client";

import { QuizStepPage } from "@/pages-root/study-step";
import { withAccount, withAuth } from "@/app/providers/auth";

export default withAuth(withAccount(QuizStepPage));
