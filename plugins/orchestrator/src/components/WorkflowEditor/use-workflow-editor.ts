import * as React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { Notification } from '@kie-tools-core/notifications/dist/api';
import {
  SwfJsonLanguageService,
  SwfYamlLanguageService,
} from '@kie-tools/serverless-workflow-language-service/dist/channel';
import {
  SwfCatalogSourceType,
  SwfServiceCatalogService,
} from '@kie-tools/serverless-workflow-service-catalog/dist/api';
import { parseApiContent } from '@kie-tools/serverless-workflow-service-catalog/dist/channel';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';

import {
  empty_definition,
  extractWorkflowFormatFromUri,
  toWorkflowString,
  WorkflowFormat,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { WorkflowEditorLanguageService } from './channel/WorkflowEditorLanguageService';

export const useWorkflowEditor = (
  workflowId?: string,
  format: WorkflowFormat = 'yaml',
) => {
  const [content, setContent] = React.useState<string>();
  const [workflowURI, setWorkflowURI] = React.useState<string>();
  const [workflowName, setWorkflowName] = React.useState<string>();
  const [languageServer, setLanguageServer] = React.useState<
    SwfJsonLanguageService | SwfYamlLanguageService
  >();
  const [catalogServices, setCatalogServices] =
    React.useState<SwfServiceCatalogService[]>();
  const [workflowError, setWorkflowError] = React.useState<string>();
  const [specsError, setSpecsError] = React.useState<string>();

  const orchestratorApi = useApi(orchestratorApiRef);

  React.useEffect(() => {
    const getWorkflow = async () => {
      if (workflowId) {
        try {
          const workflow = await orchestratorApi.getWorkflow(workflowId);
          const workflowFormat = extractWorkflowFormatFromUri(workflow.uri);
          const content = toWorkflowString(workflow.definition, workflowFormat);
          setWorkflowURI(workflow.uri);
          setContent(content);
          setWorkflowName(workflow.definition.name);
        } catch (err) {
          setWorkflowError(`Failed to fetch workflow: ${err}`);
        }
      } else {
        const content = toWorkflowString(empty_definition, format);
        setWorkflowURI(`workflow.sw.${format}`);
        setContent(content);
      }
    };
    getWorkflow();
  }, [workflowId]);

  React.useEffect(() => {
    const getSpecs = async () => {
      try {
        const specFiles = await orchestratorApi.getSpecs();
        const services = specFiles.map(specFile => {
          const parts = specFile.path.split('/');
          const filename = parts[parts.length - 1];
          return parseApiContent({
            serviceFileContent: JSON.stringify(specFile.content),
            serviceFileName: filename,
            source: {
              type: SwfCatalogSourceType.LOCAL_FS,
              absoluteFilePath: specFile.path,
            },
          });
        });

        setCatalogServices(services);
      } catch (err) {
        setSpecsError(`Failed to fetch catalog services: ${err}`);
      }
    };
    getSpecs();
  }, []);

  React.useEffect(() => {
    if (catalogServices && workflowURI) {
      const workflowEditorLanguageService = new WorkflowEditorLanguageService(
        catalogServices,
      );
      const languageServer = workflowEditorLanguageService.getLs(workflowURI);
      setLanguageServer(languageServer);
    }
  }, [catalogServices, workflowURI]);

  const validate = React.useCallback(async () => {
    if (!languageServer || !content || !workflowURI) {
      return [];
    }

    const lsDiagnostics = await languageServer.getDiagnostics({
      content: content,
      uriPath: workflowURI,
    });

    return lsDiagnostics.map(
      (lsDiagnostic: Diagnostic) =>
        ({
          path: '', // empty to not group them by path, as we're only validating one file.
          severity:
            lsDiagnostic.severity === DiagnosticSeverity.Error
              ? 'ERROR'
              : 'WARNING',
          message: `${lsDiagnostic.message} [Line ${
            lsDiagnostic.range.start.line + 1
          }]`,
          type: 'PROBLEM',
          position: {
            startLineNumber: lsDiagnostic.range.start.line + 1,
            startColumn: lsDiagnostic.range.start.character + 1,
            endLineNumber: lsDiagnostic.range.end.line + 1,
            endColumn: lsDiagnostic.range.end.character + 1,
          },
        }) as Notification,
    );
  }, [languageServer || content || workflowURI]);

  return {
    validate,
    languageServer,
    content,
    workflowURI,
    setContent,
    workflowName,
    error: specsError || workflowError,
  };
};
