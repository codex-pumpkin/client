import {Component, inject, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatIconButton} from '@angular/material/button';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';
import {combineLatest, filter, map, startWith, tap} from 'rxjs';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from '@angular/material/sidenav';
import {SettingsManager_T} from '../../model/settings/SettingsManager';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {AccountService_T} from '../../model/service/AccountService';
import {MatRipple} from '@angular/material/core';
import {TranslatePipe} from '@ngx-translate/core';
import {ConversationService_T} from '../../model/service/ConversationService';
import {CodexFormControl} from '../_common/CodexFormControl';
import {MatDivider} from '@angular/material/divider';
import {ReactiveFormsModule} from '@angular/forms';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatSuffix} from '@angular/material/input';
import {Conversation} from '../../model/domain/domain_models';
import {MatDialog} from '@angular/material/dialog';
import {
  ChangeConversationNameDialogViewModel
} from '../change-conversation-name-dialog/ChangeConversationNameDialogViewModel';
import {AccountDialogViewModel} from '../account-dialog/AccountDialogViewModel';
import {TranslateService} from '@ngx-translate/core';

/**
 * ViewModel for the COnversations component.
 */
@Component({
  templateUrl: "Home.html",
  imports: [
    MatIconButton,
    MatIcon,
    NgOptimizedImage,
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    MatRipple,
    TranslatePipe,
    MatDivider,
    ReactiveFormsModule,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatSuffix,
    RouterOutlet
  ],
  styleUrl: "Home.css"
})
export class HomeViewModel {

  /**
   The breakpoint observer.
   **/
  private readonly breakpointObserver = inject(BreakpointObserver)

  /**
   * The settings.
   */
  private readonly settings = inject(SettingsManager_T)

  /**
   * The auth service.
   */
  private readonly auth = inject(AuthenticationService_T)

  /**
   * The convo service.
   */
  private readonly conversationService = inject(ConversationService_T)

  /**
   * The account service.
   */
  private readonly accountService = inject(AccountService_T)

  /**
   * The router.
   */
  private readonly router = inject(Router)

  /**
   * The dialog handler.
   */
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly translate = inject(TranslateService)

  private readonly isMobile$ = this.breakpointObserver
    .observe(Breakpoints.HandsetPortrait)
    .pipe(
      map(result => result.matches)
    )

  /**
   * Whether this runs on mobile.
   */
  protected readonly isMobile = toSignal(this.isMobile$, {initialValue: false})

  /**
   * The currently logged in account.
   */
  protected readonly account = toSignal(
    this.auth.account$
      .pipe(
        tap(account => {
          if (!account) {
            this.router.navigate(["/login"])
          }
        }),
        filter(account => !!account)
      ),
    { initialValue: this.auth.account$.value! }
  )

  /**
   * The profile picture url
   */
  protected readonly profilePicture = toSignal(
    this.accountService.profilePicture$
      .pipe(
        filter(blob => !!blob),
        map(blob => URL.createObjectURL(blob))
      ),
    { initialValue: null }
  )

  /**
   * Whether dark mode is enabled
   */
  protected readonly isDark = toSignal(
    this.settings.settings$
      .pipe(
        map(settings => settings.isDarkMode)
      ),
    {initialValue: this.settings.settings$.value.isDarkMode}
  )

  protected readonly currentLanguage = toSignal(
    this.settings.settings$
      .pipe(
        map(settings => settings.language)
      ),
    {initialValue: this.settings.settings$.value.language}
  )

  /**
   * Whether the search s active right now.
   */
  readonly searchActive = signal(false)

  protected readonly searchForm = new CodexFormControl("", [])

  private readonly conversations$ = combineLatest([this.conversationService.conversations$,
    this.searchForm.control.valueChanges.pipe(startWith("")),
    toObservable(this.searchActive).pipe(startWith(false))])
    .pipe(
      map(([convos, value, search]) => convos.filter(convo => convo.messages.length > 0 && ((search && convo.name.toLowerCase().includes(value?.toLowerCase() ?? "")) ||
        (!search && !convo.pinned)))
      )
    )

  /**
   * The displayed conversations
   */
  protected readonly conversations = toSignal(this.conversations$)

  private readonly pinnedConversations$ = this.conversationService.conversations$
    .pipe(
      map(convos => convos.filter(convo => convo.messages.length > 0 && convo.pinned)
      )
    )

  /**
   * The displayed pinned conversations.
   */
  protected readonly pinnedConversations = toSignal(this.pinnedConversations$)

  ngOnInit() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  toggleSearch() {
    this.searchActive.set(!this.searchActive())
    if(this.searchActive()) {
      setTimeout(() => (document.getElementsByClassName("search").item(0) as HTMLElement)?.focus(), 2)
    }
  }

  addConvo() {
    this.router.navigate(["/home/conversations"])
  }

  readonly menuConversation = signal<Conversation | null>(null)

  protected toggleDrawer() {

  }

  openConvo(convo: Conversation) {
    console.log("Inside openConvo()")
     this.router.navigate([`/home/conversations/${convo.id}`])
  }

  openMenuFor(conversation: Conversation) {
    this.menuConversation.set(conversation)
    console.log(`Set menu convo ${JSON.stringify(this.menuConversation())}`)
  }

  protected openEditNameDialog() {
    const convo = this.menuConversation()

    if(!convo) {
      return
    }

    this.dialog
      .open(ChangeConversationNameDialogViewModel, {data: convo})
      .afterClosed()
      .subscribe((result: string | null) => {
        if(result) {
          this.conversationService.updateName(convo.id, result)
            .subscribe(() => {
              console.log("Will refresh convos")
              this.conversationService.refreshConversations().subscribe()
            })
        }
      });
  }

  protected deleteMenuConvo() {
    const convo = this.menuConversation()

    if(!convo) {
      return
    }

    this.conversationService.delete(convo.id)
      .subscribe(
        () => this.conversationService.refreshConversations()
          .subscribe(() => {
            this.router.navigate(["/home/conversations"])
          })
      )
  }

  pinConvo() {
    const convo = this.menuConversation()

    if(!convo) {
      return
    }

    this.conversationService.setPinned(convo.id, !convo.pinned)
      .subscribe(() => this.conversationService.refreshConversations().subscribe())
  }

  protected toggleConvoPin(convo: Conversation, event?: Event) {
    event?.stopPropagation()
    this.conversationService.setPinned(convo.id, !convo.pinned)
      .subscribe(() => this.conversationService.refreshConversations().subscribe())
  }

  toggleDarkMode() {
    this.settings.setIsDarkMode(!this.settings.settings$.value.isDarkMode)
  }

  protected toggleLanguage() {
    const next = this.settings.settings$.value.language === 'en' ? 'de' : 'en'
    this.settings.setLanguage(next)
    this.translate.use(next)
  }

  openSettings() {
    this.router.navigate(["home/settings"])
  }

  openAccount() {
    console.log("Will open account")
    this.dialog.open(AccountDialogViewModel)
      .afterClosed()
      .subscribe(navBack => {
        console.log(`Account dialog closed with navBack = ${navBack}`)
        if(navBack) {
          this.router.navigate(["/login"]).then(res => {
            console.log(`Navigation result: ${res} and got url after: ${document.URL} or from router: ${this.router.url}`)
          })
        }
      })
  }

  openAdmin() {
    this.router.navigate(["home/admin-panel"])
  }
}
