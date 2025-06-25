/**
 * GraphQL mutation for updating task text/title
 */

import { gql } from 'graphql-tag';

export const UPDATE_TASK_TEXT_MUTATION = gql`
  mutation updateTaskText($input: UpdateTaskTextInput!) {
    updateTaskText(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }

  fragment UpdateTaskPayload on UpdateTaskPayload {
    updatedTask {
      ...Task
      __typename
    }
    updatedFields {
      ...PartialTask
      __typename
    }
    success
    skipped
    __typename
  }

  fragment Task on Task {
    _id
    groupId
    taskType
    streamIds
    recommendedStreamId
    eventInfo {
      eventId
      clone
      __typename
    }
    seededEventIds
    private
    assigneeId
    createdBy
    integration {
      ...TaskIntegration
      __typename
    }
    deleted
    text
    notes
    notesMarkdown
    notesChecksum
    editorVersion
    collabSnapshot
    completed
    completedBy
    completeDate
    completeOn
    archivedAt
    duration
    runDate {
      startDate
      endDate
      __typename
    }
    snooze {
      userId
      date
      until
      __typename
    }
    timeHorizon {
      type
      relativeTo
      __typename
    }
    dueDate
    comments {
      userId
      text
      markdown
      editorVersion
      groupId
      createdAt
      editedAt
      deleted
      file
      fileMetadata {
        url
        filename
        mimetype
        size
        width
        height
        __typename
      }
      __typename
    }
    orderings {
      ordinal
      panelDate
      channelId
      userId
      __typename
    }
    backlogOrderings {
      horizonType
      position
      streamId
      __typename
    }
    subtasks {
      _id
      title
      completedDate
      completedBy
      timeEstimate
      actualTime {
        ...TaskActualTime
        __typename
      }
      snooze {
        userId
        date
        until
        __typename
      }
      scheduledTime {
        ...TaskScheduledTime
        __typename
      }
      integration {
        ...TaskIntegration
        __typename
      }
      mergedTaskId
      recommendedTimeEstimate
      __typename
    }
    subtasksCollapsed
    sequence {
      date
      id
      expiresDate
      ruleString
      searchable
      forked
      final
      estimatedStart {
        hour
        minute
        __typename
      }
      master
      finalDate
      template {
        streamIds
        private
        text
        notes
        notesMarkdown
        notesChecksum
        editorVersion
        subtasks {
          _id
          title
          completedDate
          completedBy
          timeEstimate
          actualTime {
            ...TaskActualTime
            __typename
          }
          __typename
        }
        timeEstimate
        assigneeId
        __typename
      }
      __typename
    }
    followers
    recommendedTimeEstimate
    timeEstimate
    actualTime {
      ...TaskActualTime
      __typename
    }
    scheduledTime {
      ...TaskScheduledTime
      __typename
    }
    createdAt
    lastModified
    objectiveId
    ritual {
      id
      period {
        interval
        startCalendarDay
        endCalendarDay
        __typename
      }
      __typename
    }
    __typename
  }

  fragment TaskActualTime on TaskActualTime {
    userId
    startDate
    endDate
    duration
    isTimerEntry
    __typename
  }

  fragment TaskScheduledTime on TaskScheduledTime {
    eventId
    serviceIds {
      google
      microsoft
      microsoftUniqueId
      apple
      appleRecurrenceId
      sunsama
      __typename
    }
    calendarId
    userId
    startDate
    endDate
    isAllDay
    importedFromCalendar
    __typename
  }

  fragment TaskIntegration on TaskIntegration {
    ... on TaskAsanaIntegration {
      service
      identifier {
        id
        url
        accountId
        __typename
      }
      __typename
    }
    ... on TaskTrelloIntegration {
      service
      identifier {
        id
        url
        accountId
        __typename
      }
      __typename
    }
    ... on TaskJiraIntegration {
      service
      identifier {
        id
        cloudId
        accountId
        url
        __typename
      }
      __typename
    }
    ... on TaskGithubIntegration {
      service
      identifier {
        id
        repositoryOwnerLogin
        repositoryName
        number
        type
        url
        __typename
      }
      __typename
    }
    ... on TaskTodoistIntegration {
      service
      identifier {
        id
        url
        deepUrl
        __typename
      }
      __typename
    }
    ... on TaskGoogleCalendarIntegration {
      service
      identifier {
        sunsamaId
        __typename
      }
      __typename
    }
    ... on TaskOutlookCalendarIntegration {
      service
      identifier {
        sunsamaId
        __typename
      }
      __typename
    }
    ... on TaskAppleCalendarIntegration {
      service
      identifier {
        sunsamaId
        __typename
      }
      __typename
    }
    ... on TaskSunsamaCalendarIntegration {
      service
      identifier {
        sunsamaId
        __typename
      }
      __typename
    }
    ... on TaskGmailIntegration {
      service
      identifier {
        id
        messageId
        accountId
        url
        __typename
      }
      __typename
    }
    ... on TaskOutlookIntegration {
      service
      identifier {
        id
        internetMessageId
        conversationId
        accountId
        url
        __typename
      }
      __typename
    }
    ... on TaskSlackIntegration {
      service
      identifier {
        permalink
        notesMarkdown
        __typename
      }
      __typename
    }
    ... on TaskNotionIntegration {
      service
      identifier {
        id
        workspaceId
        url
        deepUrl
        __typename
      }
      __typename
    }
    ... on TaskClickUpIntegration {
      service
      identifier {
        id
        userId
        teamId
        url
        __typename
      }
      __typename
    }
    ... on TaskGitlabIntegration {
      service
      identifier {
        id
        __typename
      }
      __typename
    }
    ... on TaskEmailIntegration {
      service
      identifier {
        id
        __typename
      }
      content {
        subject
        text
        html
        from {
          name
          email
          __typename
        }
        date
        __typename
      }
      __typename
    }
    ... on TaskLinearIntegration {
      service
      identifier {
        id
        url
        identifier
        linearUserId
        linearOrganizationId
        number
        _version
        __typename
      }
      __typename
    }
    ... on TaskMondayIntegration {
      service
      identifier {
        id
        boardId
        mondayAccountId
        url
        __typename
      }
      __typename
    }
    ... on TaskWebsiteIntegration {
      service
      identifier {
        url
        private
        canonicalUrl
        description
        faviconUrl
        imageUrl
        siteName
        title
        __typename
      }
      __typename
    }
    ... on TaskLoomVideoIntegration {
      service
      identifier {
        url
        videoId
        title
        description
        thumbnail {
          width
          height
          url
          __typename
        }
        __typename
      }
      __typename
    }
    ... on TaskMicrosoftTeamsIntegration {
      service
      identifier {
        permalink
        notesMarkdown
        __typename
      }
      __typename
    }
    ... on TaskAppleRemindersIntegration {
      service
      identifier {
        id
        listId
        autoImported
        __typename
      }
      __typename
    }
    ... on TaskGoogleTasksIntegration {
      service
      identifier {
        id
        listId
        accountId
        __typename
      }
      __typename
    }
    ... on TaskMicrosoftToDoIntegration {
      service
      identifier {
        id
        listId
        accountId
        parentTaskId
        __typename
      }
      __typename
    }
    ... on TaskSunsamaTaskIntegration {
      service
      identifier {
        taskId
        groupId
        sunsamaUserId
        __typename
      }
      __typename
    }
    __typename
  }

  fragment PartialTask on PartialTask {
    _id
    recommendedStreamId
    streamIds
    recommendedTimeEstimate
    subtasks {
      _id
      title
      completedDate
      completedBy
      timeEstimate
      actualTime {
        ...TaskActualTime
        __typename
      }
      snooze {
        userId
        date
        until
        __typename
      }
      scheduledTime {
        ...TaskScheduledTime
        __typename
      }
      integration {
        ...TaskIntegration
        __typename
      }
      mergedTaskId
      recommendedTimeEstimate
      __typename
    }
    __typename
  }
`;
