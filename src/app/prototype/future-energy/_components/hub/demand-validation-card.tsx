"use client"

import * as React from "react"
import { SafeIcon } from "@/components/prosera-lib/safe-icon"
import { Button } from "@/components/ui/prosera/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/prosera/avatar"
import { cn } from "@/lib/utils"
import { formatDateDMY } from "@/lib/compass/locale-display"
import { formatCurrency, getInitials } from "@/app/prototype/future-energy/_diamond/stages"
import { pcmButton } from "../motion"
import { employeeByRole, EMPLOYEES } from "../../data/_people"
import { tenderById } from "../../data/future-energy/_tenders"
import { useT } from "../../_i18n/use-t"
import { useStore } from "../../_store"
import { VALUE_BADGE_CLS, valueBadgeAmount } from "../value-tones"
import { ACTIVE_USER } from "./active-user"
import { avatarColor, avatarSrcFor } from "./avatar-color"
import {
  CANDIDATE_MATCHES,
  inventoryById,
  qualityByInventoryId,
  requirementById,
  reservationByInventoryId,
  type ValidationAction,
} from "../../data/future-energy/_inventory"
import {
  classificationLabel,
  formatQty,
  mergeMatch,
  summarizeRequirement,
  type MatchOverlayMap,
} from "../../data/future-energy/_demand-validation"

export function DemandValidationCard({
  action,
  overlays,
  rank,
  expanded,
  onToggleExpand,
  onRecordClick,
  followOnLabel,
  onFollowOn,
}: {
  action: ValidationAction
  overlays: MatchOverlayMap
  rank: number
  expanded?: boolean
  onToggleExpand?: () => void
  onRecordClick: () => void
  followOnLabel?: string
  onFollowOn?: () => void
}) {
  const t = useT()
  const { locale } = useStore()
  const seed = CANDIDATE_MATCHES.find((m) => m.id === action.matchId)
  const requirement = requirementById(action.requirementId)
  const match = seed ? mergeMatch(seed, overlays[seed.id]) : null
  const inventory = match ? inventoryById(match.inventoryId) : null
  const quality = match ? qualityByInventoryId(match.inventoryId) : null
  const reservation = match ? reservationByInventoryId(match.inventoryId) : null
  const owner = employeeByRole(action.owner)
  const summary = requirement ? summarizeRequirement(requirement, overlays) : null
  const ownerName = owner?.name ?? action.owner
  const pkg = requirement ? tenderById(requirement.packageId) : undefined
  const isAssignedToYou = ownerName === ACTIVE_USER.name
  const displayOwner = isAssignedToYou ? t("common.you") : ownerName
  const ownerAvatarSrc = avatarSrcFor(ownerName, EMPLOYEES, ACTIVE_USER.name)
  const initials = isAssignedToYou ? t("common.you").charAt(0).toUpperCase() : getInitials(ownerName)
  const valueType = pkg?.valueType === "protection" ? "protection" : "creation"

  if (!match || !requirement || !summary) return null

  const requestedLabel = formatQty(requirement.requestedQty, requirement.uom, locale)
  const approvedLabel = formatQty(summary.approvedInventoryQty, requirement.uom, locale)
  const residualLabel = formatQty(summary.residualProcurementQty, requirement.uom, locale)

  return (
    <article
      id={`demand-${action.id}`}
      className="rounded-[14px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[18px] py-4 shadow-[0_6px_16px_rgba(26,38,64,0.05)]"
    >
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 text-left"
      >
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-[var(--color-bg-subtle)] text-[12px] font-bold tabular-nums text-[var(--color-text-secondary)]">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-semibold leading-snug text-[var(--color-text-primary)]">
            {action.actionType} · {requirement.description}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--color-bg-subtle)] px-2 py-1 text-[11px] text-[var(--color-text-secondary)]">
              <Avatar className="size-4 shrink-0">
                {ownerAvatarSrc ? <AvatarImage src={ownerAvatarSrc} alt="" /> : null}
                <AvatarFallback className={cn(avatarColor(ownerName), "text-[8px] font-semibold text-white")}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span>
                {isAssignedToYou ? (
                  <span className="font-medium text-[var(--color-text-primary)]">{t("missionCard.assignedToYou")}</span>
                ) : (
                  <span className="font-medium text-[var(--color-text-primary)]">{t("missionCard.assignedNamed", { name: displayOwner })}</span>
                )}
              </span>
            </p>
            {action.dueDate && (
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                {`${t("demand.due")} ${formatDateDMY(action.dueDate)}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <span className="rounded-[8px] border border-[var(--color-accent-warning-text)] bg-[var(--color-bg-surface)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-accent-warning-text)]">
            {t("demand.statusReview")}
          </span>
          {pkg && (
            <span className={cn("inline-flex items-baseline gap-1.5 rounded-[8px] px-2.5 py-1.5", VALUE_BADGE_CLS[valueType])}>
              <span className="text-[15px] font-bold tabular-nums">
                {valueBadgeAmount(formatCurrency(pkg.targetSavings, locale), valueType)}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                {valueType === "creation" ? t("missionCard.create") : t("missionCard.protect")}
              </span>
            </span>
          )}
          <SafeIcon
            name={expanded ? "ChevronUp" : "ChevronDown"}
            className="size-4 text-[var(--color-text-muted)]"
          />
        </div>
      </button>

      <div className="mt-3 pl-9">
        <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          {t("demand.qtyBalance", {
            requested: requestedLabel,
            approved: approvedLabel,
            residual: residualLabel,
          })}
        </p>
        <p className="mt-1.5 text-[12px] text-[var(--color-text-secondary)]">
          {classificationLabel(match.classification, locale)} · {action.question}
        </p>
      </div>

      {expanded && (
        <dl className="mt-3 grid gap-2 pl-9 text-[12px] sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t("demand.inventory")}</dt>
            <dd className="text-[var(--color-text-primary)]">
              {match.inventoryId}
              {inventory ? ` · ${inventory.storageLocation} · ${inventory.condition} · ${inventory.inventoryStatus}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t("demand.reservation")}</dt>
            <dd className="text-[var(--color-text-primary)]">
              {reservation
                ? t("demand.reservationLine", {
                    id: reservation.id,
                    qty: formatQty(reservation.reservedQty, reservation.uom, locale),
                    project: reservation.owningProject,
                    transfer: reservation.transferPermitted === "No" ? t("demand.transferNo") : t("demand.transferConditional"),
                  })
                : t("demand.none")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t("demand.matchBasis")}</dt>
            <dd className="text-[var(--color-text-primary)]">{match.matchBasis}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t("demand.outstandingCheck")}</dt>
            <dd className="text-[var(--color-text-primary)]">{quality?.outstandingCheck || action.question}</dd>
          </div>
        </dl>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5 pl-9">
        <Button
          type="button"
          onClick={onRecordClick}
          className={cn(pcmButton, "h-[29px] gap-1.5 rounded-[8px] bg-[var(--color-bg-inverse)] px-[13px] text-[12px] font-semibold text-[var(--color-text-inverse)] hover:opacity-90")}
        >
          <SafeIcon name="ClipboardCheck" className="h-3.5 w-3.5" />
          {t("demand.recordDisposition")}
        </Button>
        {followOnLabel && onFollowOn && (
          <Button
            type="button"
            variant="ghost"
            onClick={onFollowOn}
            className="h-[29px] rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] px-[11px] text-[12px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          >
            {followOnLabel}
          </Button>
        )}
      </div>
    </article>
  )
}
