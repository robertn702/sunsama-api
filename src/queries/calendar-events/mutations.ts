/**
 * Calendar event GraphQL mutations
 */

import { gql } from 'graphql-tag';
import { CREATE_CALENDAR_EVENT_PAYLOAD_FRAGMENT } from './fragments.js';

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
