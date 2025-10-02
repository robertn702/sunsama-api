/**
 * User-related GraphQL queries
 */

import { gql } from 'graphql-tag';

export const GET_USER_QUERY = gql`
  query getUser {
    currentUser {
      _id
      activationDate
      admin
      aka
      calendar {
        items {
          id
          accountId
          google {
            summary
            summaryOverride
            timeZone
            selected
            accessRole
            accountId
            __typename
          }
          microsoft {
            id
            name
            color
            hexColor
            isDefaultCalendar
            canShare
            canViewPrivateItems
            canEdit
            isRemovable
            allowedOnlineMeetingProviders
            defaultOnlineMeetingProvider
            isTallyingResponse
            owner {
              address
              name
              __typename
            }
            primary
            accountId
            __typename
          }
          __typename
        }
        __typename
      }
      services {
        google {
          scope
          id
          email
          name
          picture
          locale
          __typename
        }
        microsoft {
          scope
          id
          email
          name
          isPersonalAccount
          __typename
        }
        phoneNumber {
          number
          verified
          otpExpiresAt
          __typename
        }
        ssoEnforced
        __typename
      }
      emails {
        address
        verified
        __typename
      }
      primaryGroup {
        groupId
        __typename
      }
      onboarding
      preferences {
        clockStyle
        defaultCalendarView
        defaultHomeView
        defaultMainPanel
        defaultMobileCalendarView
        defaultHideTasks
        hideTeamEvtCopies
        hideMessenger
        disableSpellcheck
        channelRecommendations
        plannedTimeRecommendations
        subtaskPlannedTimeRecommendations
        startDayOfWeekOffset
        workingSessionTransparency
        workingSessionVisibility
        workingSessionDuration
        promptToUpdateStatus
        darkMode
        keyboardShortcuts
        customKeyboardShortcuts {
          id
          disabled
          global
          key
          metaKey
          ctrlKey
          shiftKey
          __typename
        }
        autoArchiveThreshold
        showDeclinedEvents
        usePlannedTimeAsActualTime
        rollToTop
        includeWeekendInReflection
        planningAutoRollover
        autoFocus
        focusBarDisabledTriggers
        workloadThreshold
        importEventFilters
        autoImportEvents
        importEventCompletionSync
        workingSessionCalendarReminder
        workingSessionBuffer
        focusModeNextUpReminder
        autoRescheduleWorkingSessionConflicts
        autoRescheduleWorkingSessionCompletions
        schedulingHours {
          start {
            hour
            minute
            __typename
          }
          end {
            hour
            minute
            __typename
          }
          __typename
        }
        defaultEmailClient
        timerNotificationsEnabled
        timerNotificationsSoundId
        timerPomodoroNotificationsSoundId
        timerNotificationsVolume
        timerNotificationsTimeRemainingTriggers
        endOfDayMessageId
        endOfDayCustomMessage
        autoBreak
        defaultTargetFocusDuration
        defaultTargetBreakDuration
        defaultFocusTimerView
        completedTaskCalendarPinStyle
        hideCompletedTasks
        insertTaskPosition
        chatToolFocusSyncTrigger
        chatToolFocusSyncUpdateStatus
        chatToolFocusSyncUpdateDnd
        chatToolFocusSyncPrivacy
        chatToolFocusSyncStatusEmoji
        navigationPanelStyle
        preferredAILanguage
        preferredLanguage
        visualizeTaskProjectedTimeOnCalendar
        visualizeTaskActualTimeOnCalendar
        __typename
      }
      contacts {
        integrationEnabled
        usesNewPeopleApi
        accountId
        __typename
      }
      createdAt
      dailyPlanning {
        snoozedUntilDate
        lastDayPlanned
        disabledSteps
        importEventsWithoutInvitees
        __typename
      }
      dailyShutdown {
        snoozedUntilDate
        lastDayShutdown
        __typename
      }
      daysPlanned
      daysShutdown
      desktopApp {
        darwin {
          status
          deferralDate
          __typename
        }
        win32 {
          status
          deferralDate
          __typename
        }
        linux {
          status
          deferralDate
          __typename
        }
        __typename
      }
      mobileApp {
        status
        os
        lastModified
        __typename
      }
      lastAnnouncementCheckDate
      lastModified
      nodeId
      notifySettings {
        inviteeResponse {
          subscribed
          channels
          __typename
        }
        invitedToEvent {
          subscribed
          channels
          __typename
        }
        eventUpdated {
          subscribed
          channels
          __typename
        }
        eventCancelled {
          subscribed
          channels
          __typename
        }
        newComments {
          subscribed
          channels
          __typename
        }
        shareTasks {
          subscribed
          channels
          __typename
        }
        taskComment {
          subscribed
          channels
          __typename
        }
        taskStream {
          subscribed
          channels
          __typename
        }
        taskAssignee {
          subscribed
          channels
          __typename
        }
        taskCompletion {
          subscribed
          channels
          __typename
        }
        taskSchedule {
          subscribed
          channels
          __typename
        }
        taskCreation {
          subscribed
          channels
          __typename
        }
        eventReminders {
          subscribed
          channels
          __typename
        }
        dossier {
          subscribed
          channels
          __typename
        }
        planYourDay {
          subscribed
          channels
          __typename
        }
        weeklyStats {
          subscribed
          channels
          __typename
        }
        weekReview {
          subscribed
          channels
          __typename
        }
        systemUpdates {
          subscribed
          channels
          __typename
        }
        dailyWrapSeen {
          subscribed
          channels
          __typename
        }
        dailyWrapReply {
          subscribed
          channels
          __typename
        }
        __typename
      }
      profile {
        profilePictureURL
        firstname
        lastname
        timezone
        timezoneWarningDisabled
        profileThumbs {
          image_24
          image_32
          image_48
          image_72
          image_192
          __typename
        }
        useCase
        onboardingEventSent
        __typename
      }
      toursCompleted
      username
      waitList
      weeklyPlanning {
        hour
        minute
        isoWeekday
        lastWeekPlanned
        weeksPlanned
        disabled
        __typename
      }
      weeklyReview {
        hour
        minute
        isoWeekday
        lastWeekReviewed
        weeksReviewed
        disabled
        __typename
      }
      lastArchiveCheckDate
      integrationRequests
      dayStart {
        hour
        minute
        disabled
        __typename
      }
      plannedDayStart {
        hour
        minute
        disabled
        __typename
      }
      dayEnd {
        hour
        minute
        disabled
        __typename
      }
      waitlistId
      trialPeriod
      qualificationAssessment
      disappointmentIndex
      emailCourses {
        id
        status
        __typename
      }
      tracking {
        facebook {
          _fbp
          _fbc
          __typename
        }
        chatSetupConfigId
        __typename
      }
      proficiencies {
        id
        count
        proficient
        proficientAt
        firstPerformedAt
        __typename
      }
      assistant {
        scheduledCalls {
          workflow
          reminder {
            schedule {
              enabled
              isoDayIndex
              time {
                hour
                minute
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      dailyWrap {
        reminder {
          schedule {
            enabled
            isoDayIndex
            time {
              hour
              minute
              __typename
            }
            __typename
          }
          nextDeliveryAt
          __typename
        }
        __typename
      }
      dailyCatchUp {
        reminder {
          schedule {
            enabled
            isoDayIndex
            time {
              hour
              minute
              __typename
            }
            __typename
          }
          nextDeliveryAt
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
