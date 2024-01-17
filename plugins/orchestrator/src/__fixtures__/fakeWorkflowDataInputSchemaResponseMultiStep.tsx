import { WorkflowDataInputSchemaResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

export const fakeDataInputSchemaMultiStepReponse: WorkflowDataInputSchemaResponse =
  {
    workflowItem: {
      uri: 'orchestrator-ansible-job-long-timeout.sw.yaml',
      definition: {
        id: 'orchestrator-ansible-job-long-timeout',
        version: '1.0',
        specVersion: '0.8',
        name: '[WF] Ansible Job with Jira and Timeout',
        description:
          '[WF] Launch an Ansible Job within Ansible Automation Platform with Jira integration and Timeout',
        dataInputSchema:
          'schemas/orchestrator-ansible-job-long__main_schema.json',
        functions: [
          {
            name: 'runActionTemplateFetch',
            operation: 'specs/actions-openapi.json#fetch:template',
          },
          {
            name: 'runActionGitHubRepoPush',
            operation: 'specs/actions-openapi.json#github:repo:push',
          },
          {
            name: 'runActionCatalogRegister',
            operation: 'specs/actions-openapi.json#catalog:register',
          },
          {
            name: 'jiraCreateIssue',
            operation: 'specs/jira-openapi.json#createIssue',
          },
          {
            name: 'jiraCloseIssue',
            operation: 'specs/jira-openapi.json#transitionIssue',
          },
          {
            name: 'jiraGetIssueTransitions',
            operation: 'specs/jira-openapi.json#getIssueTransitions',
          },
          {
            name: 'print',
            type: 'custom',
            operation: 'sysout',
          },
        ],
        events: [
          {
            name: 'callbackEvent',
            type: 'jira_webhook_callback',
            source: 'jira.test',
          },
        ],
        errors: [
          {
            name: 'Error',
            code: 'java.lang.RuntimeException',
          },
        ],
        start: 'Generating the Ansible Job component',
        states: [
          {
            name: 'Generating the Ansible Job component',
            type: 'operation',
            actionMode: 'sequential',
            actions: [
              {
                name: 'Run Template Fetch Action',
                functionRef: {
                  refName: 'runActionTemplateFetch',
                  arguments: {
                    id: '$WORKFLOW.instanceId',
                    url: '"https://github.com/janus-idp/software-templates/tree/main/templates/github/launch-ansible-job/skeleton"',
                    targetPath: '"argo/ansibleJobs/"',
                    values: {
                      component_id: '.component_id',
                      jobTemplate: '.jobTemplate',
                      name: '.component_id',
                      namespace: '.namespace',
                      connection_secret: '.connection_secret',
                    },
                  },
                },
                actionDataFilter: {
                  toStateData: '.ansibleJobResult',
                },
              },
            ],
            compensatedBy: 'Clean resources',
            transition: 'Generating the Catalog Info Component',
          },
          {
            name: 'Generating the Catalog Info Component',
            type: 'operation',
            actionMode: 'sequential',
            actions: [
              {
                name: 'Catalog template action',
                functionRef: {
                  refName: 'runActionTemplateFetch',
                  arguments: {
                    id: '$WORKFLOW.instanceId',
                    url: '"https://github.com/janus-idp/software-templates/tree/main/skeletons/catalog-info"',
                    values: {
                      githubOrg: '.githubOrg',
                      repoName: '.repoName',
                      owner: '.owner',
                      applicationType: 'api',
                      system: 'system:default/podcast',
                      description: '.description',
                    },
                  },
                },
                actionDataFilter: {
                  toStateData: '.catalogTemplateResult',
                },
              },
            ],
            compensatedBy: 'Clean resources',
            transition: 'Publish to GitHub',
          },
          {
            name: 'Publish to GitHub',
            type: 'operation',
            actionMode: 'sequential',
            actions: [
              {
                name: 'Publish github action',
                functionRef: {
                  refName: 'runActionGitHubRepoPush',
                  arguments: {
                    id: '$WORKFLOW.instanceId',
                    repoUrl:
                      '"github.com?owner=" + .githubOrg + "&repo=" + .repoName',
                    defaultBranch: '.defaultBranch',
                    protectDefaultBranch: false,
                    protectEnforceAdmins: false,
                  },
                },
                actionDataFilter: {
                  toStateData: '.publishGithubResult',
                },
              },
            ],
            onErrors: [
              {
                errorRef: 'Error',
                transition: 'Handle Github Error',
              },
            ],
            transition: 'Register Catalog entry',
          },
          {
            name: 'Handle Github Error',
            type: 'operation',
            actions: [
              {
                name: 'Handle Github Error',
                functionRef: {
                  refName: 'print',
                  arguments: {
                    message: 'Error publishing to github',
                  },
                },
              },
            ],
            transition: 'Open Jira issue',
          },
          {
            name: 'Open Jira issue',
            type: 'callback',
            action: {
              name: 'callbackAction',
              functionRef: {
                refName: 'jiraCreateIssue',
                arguments: {
                  fields: {
                    assignee: {
                      name: '.jiraAssignee',
                    },
                    description:
                      '"Create Github Repository: https://github.com/" + .githubOrg + "/" + .repoName + "\\n To create the new repository: https://github.com/new"',
                    issuetype: {
                      name: 'Task',
                    },
                    labels: [
                      'backstage-workflow',
                      '"workflowId=" + $WORKFLOW.instanceId',
                    ],
                    project: {
                      key: '.jiraProjectKey',
                    },
                    reporter: {
                      name: '.jiraReporter',
                    },
                    priority: {
                      name: 'High',
                    },
                    summary: 'New Repository for Ansible project on Backstage',
                  },
                },
              },
              actionDataFilter: {
                toStateData: '.jiraCreateIssueResult',
              },
            },
            eventRef: 'callbackEvent',
            eventDataFilter: {
              toStateData: '.jiraResolveIssueResult',
            },
            timeouts: {
              eventTimeout: 'PT20S',
            },
            compensatedBy: 'Close Jira issue',
            transition: 'Check Repository Created',
          },
          {
            name: 'Check Repository Created',
            type: 'switch',
            dataConditions: [
              {
                condition: '.jiraResolveIssueResult != null',
                transition: 'Publish to GitHub',
                name: 'created',
              },
            ],
            defaultCondition: {
              transition: {
                compensate: true,
                nextState: 'End workflow with error',
              },
            },
          },
          {
            name: 'Register Catalog entry',
            type: 'operation',
            actionMode: 'sequential',
            actions: [
              {
                name: 'Register catalog action',
                functionRef: {
                  refName: 'runActionCatalogRegister',
                  arguments: {
                    id: '$WORKFLOW.instanceId',
                    repoContentsUrl: '.publishGithubResult.repoContentsUrl',
                    catalogInfoPath: '"/catalog-info.yaml"',
                  },
                },
                actionDataFilter: {
                  toStateData: '.catalogRegisterResult',
                },
              },
            ],
            end: true,
          },
          {
            name: 'Clean resources',
            type: 'operation',
            actions: [
              {
                name: 'Clean resources',
                functionRef: {
                  refName: 'print',
                  arguments: {
                    message: 'Cleaning resources',
                  },
                },
              },
            ],
            usedForCompensation: true,
          },
          {
            name: 'Close Jira issue',
            type: 'operation',
            actionMode: 'sequential',
            actions: [
              {
                name: 'get transition id',
                actionDataFilter: {
                  toStateData: '.jiraGetTransitionResult',
                },
                functionRef: {
                  refName: 'jiraGetIssueTransitions',
                  arguments: {
                    issueIdOrKey: '.jiraCreateIssueResult.id',
                  },
                },
              },
              {
                name: 'close the jira issue',
                actionDataFilter: {
                  toStateData: '.jiraCloseIssueResult',
                },
                functionRef: {
                  refName: 'jiraCloseIssue',
                  arguments: {
                    issueIdOrKey: '.jiraCreateIssueResult.id',
                    transition: {
                      id: '.jiraGetTransitionResult.transitions[] | select(.name | contains("Close")) | .id',
                    },
                    update: {
                      comment: [
                        {
                          add: {
                            body: 'Issue closed due to time out on Backstage workflow',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
            usedForCompensation: true,
          },
          {
            name: 'End workflow with error',
            type: 'operation',
            actions: [
              {
                name: 'End log',
                functionRef: {
                  refName: 'print',
                  arguments: {
                    message: 'Ending',
                  },
                },
              },
            ],
            end: true,
          },
        ],
      },
    },
    schemas: [
      {
        $id: 'classpath:/schemas/orchestrator-ansible-job-long__sub_schema__Generating_the_Ansible_Job_component_Run_Template_Fetch_Action_runActionTemplateFetch.json',
        title:
          'orchestrator-ansible-job-long: Generating the Ansible Job component > Run Template Fetch Action > runActionTemplateFetch',
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          component_id: {
            title: 'component_id',
            description:
              'Extracted from https://github.com/janus-idp/software-templates/tree/main/templates/github/launch-ansible-job/skeleton',
            type: 'string',
          },
          jobTemplate: {
            title: 'jobTemplate',
            description:
              'Extracted from https://github.com/janus-idp/software-templates/tree/main/templates/github/launch-ansible-job/skeleton',
            type: 'string',
          },
          namespace: {
            title: 'namespace',
            description:
              'Extracted from https://github.com/janus-idp/software-templates/tree/main/templates/github/launch-ansible-job/skeleton',
            type: 'string',
          },
          connection_secret: {
            title: 'connection_secret',
            description:
              'Extracted from https://github.com/janus-idp/software-templates/tree/main/templates/github/launch-ansible-job/skeleton',
            type: 'string',
          },
        },
        required: [
          'component_id',
          'jobTemplate',
          'namespace',
          'connection_secret',
        ],
      },
      {
        $id: 'classpath:/schemas/orchestrator-ansible-job-long__sub_schema__Generating_the_Catalog_Info_Component_Catalog_template_action_runActionTemplateFetch.json',
        title:
          'orchestrator-ansible-job-long: Generating the Catalog Info Component > Catalog template action > runActionTemplateFetch',
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          repoName: {
            title: 'repoName',
            description:
              'Extracted from https://github.com/janus-idp/software-templates/tree/main/skeletons/catalog-info',
            type: 'string',
          },
          owner: {
            title: 'owner',
            description:
              'Extracted from https://github.com/janus-idp/software-templates/tree/main/skeletons/catalog-info',
            type: 'string',
          },
          description: {
            title: 'description',
            description:
              'Extracted from https://github.com/janus-idp/software-templates/tree/main/skeletons/catalog-info',
            type: 'string',
          },
        },
        required: ['repoName', 'owner', 'description'],
      },
      {
        $id: 'classpath:/schemas/orchestrator-ansible-job-long__sub_schema__Publish_to_GitHub_Publish_github_action_runActionGitHubRepoPush.json',
        title:
          'orchestrator-ansible-job-long: Publish to GitHub > Publish github action > runActionGitHubRepoPush',
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          defaultBranch: {
            title: 'Default Branch',
            type: 'string',
            description:
              "Sets the default branch on the repository. The default value is 'master'",
          },
        },
        required: ['defaultBranch'],
      },
      {
        $id: 'classpath:/schemas/orchestrator-ansible-job-long__sub_schema__Additional_input_data.json',
        title: 'orchestrator-ansible-job-long: Additional input data',
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          githubOrg: {
            title: 'githubOrg',
            type: 'string',
            description: 'Extracted from the Workflow definition',
          },
          jiraAssignee: {
            title: 'jiraAssignee',
            type: 'string',
            description: 'Extracted from the Workflow definition',
          },
          jiraProjectKey: {
            title: 'jiraProjectKey',
            type: 'string',
            description: 'Extracted from the Workflow definition',
          },
          jiraReporter: {
            title: 'jiraReporter',
            type: 'string',
            description: 'Extracted from the Workflow definition',
          },
        },
      },
    ],
  };
