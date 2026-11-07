"use client";

import { withAuth } from "@/app/providers/auth";
import { ProfileAchievementsPage } from "@/pages-root/profile";

export default withAuth(ProfileAchievementsPage);
