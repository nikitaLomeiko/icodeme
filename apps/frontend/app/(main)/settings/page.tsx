"use client";

import { withAuth } from "@/app/providers/auth";
import { SettingsPage } from "@/pages-root/settings";

export default withAuth(SettingsPage);
