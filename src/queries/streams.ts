/**
 * Stream-related GraphQL queries
 */

import { gql } from 'graphql-tag';
import { STREAM_FRAGMENT } from './fragments/index.js';

export const GET_STREAMS_BY_GROUP_ID_QUERY = gql`
  query getStreamsByGroupId($groupId: String!) {
    streamsByGroupId(groupId: $groupId) {
      ...StreamData
      __typename
    }
  }

  ${STREAM_FRAGMENT}
`;
