/**
 * Stream-related GraphQL fragments
 */

import { gql } from 'graphql-tag';

export const STREAM_FRAGMENT = gql`
  fragment StreamData on Stream {
    _id
    groupId
    createdAt
    createdBy
    streamName
    category
    categoryStreamId
    personal
    description
    status
    lastModified
    slackChannelId
    slackAccountId
    standup {
      channel
      rule {
        isoDays
        hour
        minute
        __typename
      }
      nextStandupDate
      lastStandupDate
      timezone
      __typename
    }
    editTrail {
      userId
      editDate
      __typename
    }
    color
    memberIds
    private
    projectIntegrations {
      integration
      projectId
      accountId
      userId
      __typename
    }
    schedules {
      userId
      timeSpans {
        id
        dayIndex
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
      __typename
    }
    deleted
    __typename
  }
`;