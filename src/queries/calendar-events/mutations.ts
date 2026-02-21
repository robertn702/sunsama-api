/**
 * Calendar event GraphQL mutations
 */

import { gql } from 'graphql-tag';
import {
  CREATE_CALENDAR_EVENT_PAYLOAD_FRAGMENT,
  UPDATE_CALENDAR_EVENT_PAYLOAD_FRAGMENT,
} from './fragments.js';

/**
 * Mutation for creating a new calendar event
 *
 * Variables:
 * - input.calendarEvent: The complete calendar event object to create
 * - input.groupId: The group ID
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const CREATE_CALENDAR_EVENT_MUTATION = gql`
  mutation createCalendarEvent($input: CreateCalendarEventInput!) {
    createCalendarEventV2(input: $input) {
      ...CreateCalendarEventPayload
      __typename
    }
  }
  ${CREATE_CALENDAR_EVENT_PAYLOAD_FRAGMENT}
`;

/**
 * Mutation for updating a calendar event
 *
 * Variables:
 * - input.update: The calendar event update data (full event object)
 * - input.eventId: The ID of the event to update
 * - input.groupId: The group ID
 * - input.isInviteeStatusUpdate: Whether this is an invitee status update
 * - input.inviteeEmail: The invitee's email address
 * - input.skipReorder: Whether to skip reordering
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_CALENDAR_EVENT_MUTATION = gql`
  mutation updateCalendarEvent($input: UpdateCalendarEventInput!) {
    updateCalendarEventV2(input: $input) {
      ...UpdateCalendarEventPayload
      __typename
    }
  }
  ${UPDATE_CALENDAR_EVENT_PAYLOAD_FRAGMENT}
`;
