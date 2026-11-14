"use client";

import { TerminalStepPage } from "@/pages-root/study-step";
import { withAccount, withAuth } from "@/app/providers/auth";

export default withAuth(withAccount(TerminalStepPage));
