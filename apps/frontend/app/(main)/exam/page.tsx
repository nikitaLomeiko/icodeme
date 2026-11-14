"use client";

import { withAccount, withAuth } from "@/app/providers/auth";
import { ExamRoute } from "@/pages-root/study-step";

export default withAuth(withAccount(ExamRoute));
