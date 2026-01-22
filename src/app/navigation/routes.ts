import {LoginViewModel} from '../vvm/login/LoginViewModel';
import {SignupViewModel} from '../vvm/signup/SignupViewModel';
import {EmailNotVerifiedViewModel} from '../vvm/email-not-verified/EmailNotVerifiedViewModel';
import {EmailVerificationViewModel} from '../vvm/email-verification/EmailVerificationViewModel';
import {PasswordResetViewModel} from '../vvm/password-reset/PasswordResetViewModel';
import {RequestPasswordResetViewModel} from '../vvm/request-password-reset/RequestPasswordResetViewModel';
import {HomeViewModel} from '../vvm/home/HomeViewModel';
import {ConversationsViewModel} from '../vvm/conversations/ConversationsViewModel';
import {AdminPanelViewModel} from '../vvm/admin-panel/AdminPanelViewModel';
import {SettingsViewModel} from '../vvm/settings/SettingsViewModel';
import {Routes} from '@angular/router';
import {AccountAuthGuard, VerifiedAuthGuard} from './guards/auth_guards';

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  },
  {
    path: "login",
    component: LoginViewModel
  },
  {
    path: "signup",
    component: SignupViewModel
  },
  {
    path: "email-not-verified",
    component: EmailNotVerifiedViewModel,
    canActivate: [AccountAuthGuard]
  },
  {
    path: "email-verification/:token",
    component: EmailVerificationViewModel
  },
  {
    path: "reset-password/:token",
    component: PasswordResetViewModel
  },
  {
    path: "request-password-reset",
    component: RequestPasswordResetViewModel
  },
  {
    path: "home",
    component: HomeViewModel,
    children: [
      {
        path: "",
        redirectTo: "conversations/",
        pathMatch: "full"
      },
      {
        path: "conversations/:id",
        component: ConversationsViewModel,
        canActivate: [VerifiedAuthGuard]
      },
      {
        path: "admin-panel",
        component: AdminPanelViewModel,
        canActivate: [VerifiedAuthGuard]
      },
      {
        path: "settings",
        component: SettingsViewModel,
        canActivate: [VerifiedAuthGuard]
      },
    ]
  }

]
