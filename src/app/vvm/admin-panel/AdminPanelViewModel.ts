import {Component, inject, OnInit} from '@angular/core';
import {CodexFormControl} from '../_common/CodexFormControl';
import {CodexValidators} from '../_common/CodexValidators';
import {InformationService_T} from '../../model/service/InformationService';
import {toSignal} from '@angular/core/rxjs-interop';
import {TranslatePipe} from '@ngx-translate/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {ReactiveFormsModule} from '@angular/forms';
import {MatError, MatFormField} from '@angular/material/input';
import {MatInput, MatLabel} from '@angular/material/input';
import {filter} from 'rxjs';

/**
 * ViewModel for the admin-panel component.
 */
@Component({
  templateUrl: "AdminPanel.html",
  imports: [
    TranslatePipe,
    MatCheckbox,
    ReactiveFormsModule,
    MatError,
    MatFormField,
    MatInput,
    MatLabel
  ],
  styleUrl: "AdminPanel.css"
})
export class AdminPanelViewModel implements OnInit {

  /**
   * The info service.
   */
  infoService = inject(InformationService_T)

  /**
   * Whether an admin quota is active.
   */
  readonly adminQuotaActive = new CodexFormControl<boolean>(false, [])

  /**
   * Whether a normal quota is active.
   */
  readonly normalQuotaActive = new CodexFormControl<boolean>(false, [])

  /**
   * The admin quota number
   */
  readonly adminQuota = new CodexFormControl<number | null>(null, [CodexValidators.integer, CodexValidators.positive])

  /**
   * The normal quota
   */
  readonly normalQuota = new CodexFormControl<number | null>(null, [CodexValidators.integer, CodexValidators.positive])

  ngOnInit(): void {
    const quota = this.infoService.quotaInfo$.value

    // Set initial active values
    this.adminQuotaActive.control.setValue(quota.admin > 0)
    this.normalQuotaActive.control.setValue(quota.member > 0)

    // Set initial quota values
    this.adminQuota.control.setValue(quota.admin > 0 ? quota.admin : null)
    this.normalQuota.control.setValue(quota.member > 0 ? quota.member : null)

    // Set initial quota enabled/disabled states
    if(quota.admin > 0) {
      this.adminQuota.control.enable()
    } else {
      this.adminQuota.control.disable()
    }
    if(quota.member > 0) {
      this.normalQuota.control.enable()
    } else {
      this.normalQuota.control.disable()
    }

    // When quotas are disabled, set them to null
    this.adminQuotaActive.control.valueChanges.subscribe(isActive => {
      if(isActive) {
        this.adminQuota.control.setValue(100)
        this.adminQuota.control.enable()
      } else {
        this.adminQuota.control.setValue(null)
        this.adminQuota.control.disable()
      }
    })
    this.normalQuotaActive.control.valueChanges.subscribe(isActive => {
      if(isActive) {
        this.normalQuota.control.setValue(100)
        this.normalQuota.control.enable()
      } else {
        this.normalQuota.control.setValue(null)
        this.normalQuota.control.disable()
      }
    })

    // When any value changes, we make it the remote one.
    this.adminQuota.control.valueChanges.subscribe(value => {
      if(this.adminQuota.control.invalid) return
      const newQuota = {
        admin: value ?? 0,
        member: this.normalQuota.control.value ?? 0
      }

      this.infoService.setQuota(newQuota).subscribe()
    })
    this.normalQuota.control.valueChanges.subscribe(value => {
      if(this.normalQuota.control.invalid) return
      const newQuota = {
        member: value ?? 0,
        admin: this.adminQuota.control.value ?? 0
      }

      this.infoService.setQuota(newQuota).subscribe()
    })
  }

  /**
   * The analytics.
   */
  readonly analytics = toSignal(
    this.infoService.analytics$
      .pipe(
        filter(ana => !!ana)
      ),
    { initialValue: this.infoService.analytics$.value! }
  )

}
