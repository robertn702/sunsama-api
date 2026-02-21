/**
 * GraphQL fragments for calendar event operations
 */

import { gql } from 'graphql-tag';

/**
 * Fragment for CalendarEventServiceIds
 */
export const CALENDAR_EVENT_SERVICE_IDS_FRAGMENT = gql`
  fragment CalendarEventServiceIds on CalendarEventServiceIds {
    google
    microsoft
    microsoftUniqueId
    apple
    appleRecurrenceId
    sunsama
    __typename
  }
`;

/**
 * Fragment for CalendarEventScheduledToEntry
 */
export const CALENDAR_EVENT_SCHEDULED_TO_ENTRY_FRAGMENT = gql`
  fragment CalendarEventScheduledToEntry on CalendarEventScheduledToEntry {
    calendarId
    userId
    __typename
  }
`;

/**
 * Fragment for CalendarEventOrganizerCalendar
 */
export const CALENDAR_EVENT_ORGANIZER_CALENDAR_FRAGMENT = gql`
  fragment CalendarEventOrganizerCalendar on CalendarEventOrganizerCalendar {
    calendarId
    calendarDisplayName
    __typename
  }
`;

/**
 * Fragment for CalendarEventInvitee
 */
export const CALENDAR_EVENT_INVITEE_FRAGMENT = gql`
  fragment CalendarEventInvitee on CalendarEventInvitee {
    userId
    email
    name
    requirement
    status
    type {
      admin
      guest
      __typename
    }
    profilePicture
    resource
    __typename
  }
`;

/**
 * Fragment for CalendarEventLocation
 */
export const CALENDAR_EVENT_LOCATION_FRAGMENT = gql`
  fragment CalendarEventLocation on CalendarEventLocation {
    name
    address
    alias
    coordinate {
      lat
      lng
      __typename
    }
    __typename
  }
`;

/**
 * Fragment for CalendarEventPermissions
 */
export const CALENDAR_EVENT_PERMISSIONS_FRAGMENT = gql`
  fragment CalendarEventPermissions on CalendarEventPermissions {
    guestsCanModify
    guestsCanInviteOthers
    guestsCanSeeOtherGuests
    anyoneCanAddSelf
    locked
    privateCopy
    __typename
  }
`;

/**
 * Fragment for CalendarEventConferenceData
 */
export const CALENDAR_EVENT_CONFERENCE_DATA_FRAGMENT = gql`
  fragment CalendarEventConferenceData on CalendarEventConferenceData {
    createRequest {
      requestId
      conferenceSolutionKey {
        type
        __typename
      }
      __typename
    }
    entryPoints {
      entryPointType
      uri
      label
      pin
      __typename
    }
    conferenceSolution {
      key {
        type
        __typename
      }
      name
      iconUri
      __typename
    }
    conferenceId
    signature
    __typename
  }
`;

/**
 * Fragment for the full CalendarEvent type
 */
export const CALENDAR_EVENT_FRAGMENT = gql`
  fragment CalendarEvent on CalendarEvent {
    _id
    createdBy
    date {
      startDate
      endDate
      isAllDay
      timeZone
      __typename
    }
    inviteeList {
      ...CalendarEventInvitee
      __typename
    }
    location {
      ...CalendarEventLocation
      __typename
    }
    staticMapUrl
    status
    title
    createdAt
    scheduledTo {
      ...CalendarEventScheduledToEntry
      __typename
    }
    organizerCalendar {
      ...CalendarEventOrganizerCalendar
      __typename
    }
    service
    serviceIds {
      ...CalendarEventServiceIds
      __typename
    }
    description
    sequence
    streamIds
    lastModified
    permissions {
      ...CalendarEventPermissions
      __typename
    }
    hangoutLink
    googleCalendarURL
    transparency
    visibility
    googleLocation
    conferenceData {
      ...CalendarEventConferenceData
      __typename
    }
    recurringEventInfo {
      recurringEventId
      recurrence
      __typename
    }
    runDate {
      startDate
      endDate
      __typename
    }
    agenda {
      _id
      groupId
      __typename
    }
    outcomes {
      _id
      groupId
      __typename
    }
    childTasks {
      taskId
      groupId
      userId
      __typename
    }
    visualizationPreferences {
      userId
      settings {
        blockProjections
        __typename
      }
      __typename
    }
    seedTask {
      _id
      groupId
      __typename
    }
    eventType
    _userCanView
    _userCanEdit
    _calendarId
    __typename
  }
  ${CALENDAR_EVENT_INVITEE_FRAGMENT}
  ${CALENDAR_EVENT_LOCATION_FRAGMENT}
  ${CALENDAR_EVENT_SCHEDULED_TO_ENTRY_FRAGMENT}
  ${CALENDAR_EVENT_ORGANIZER_CALENDAR_FRAGMENT}
  ${CALENDAR_EVENT_SERVICE_IDS_FRAGMENT}
  ${CALENDAR_EVENT_PERMISSIONS_FRAGMENT}
  ${CALENDAR_EVENT_CONFERENCE_DATA_FRAGMENT}
`;

/**
 * Fragment for CreateCalendarEventPayload
 */
export const CREATE_CALENDAR_EVENT_PAYLOAD_FRAGMENT = gql`
  fragment CreateCalendarEventPayload on CreateCalendarEventPayload {
    createdCalendarEvent {
      ...CalendarEvent
      __typename
    }
    updatedFields {
      serviceIds {
        ...CalendarEventServiceIds
        __typename
      }
      conferenceData {
        ...CalendarEventConferenceData
        __typename
      }
      status
      scheduledTo {
        ...CalendarEventScheduledToEntry
        __typename
      }
      organizerCalendar {
        ...CalendarEventOrganizerCalendar
        __typename
      }
      inviteeList {
        ...CalendarEventInvitee
        __typename
      }
      location {
        ...CalendarEventLocation
        __typename
      }
      googleCalendarURL
      hangoutLink
      permissions {
        ...CalendarEventPermissions
        __typename
      }
      __typename
    }
    success
    __typename
  }
  ${CALENDAR_EVENT_FRAGMENT}
`;
