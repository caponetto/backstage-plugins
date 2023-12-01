import * as React from 'react';

import { EditorTheme } from '@kie-tools-core/editor/dist/api';
import { getOperatingSystem } from '@kie-tools-core/operating-system';
import {
  FileLanguage,
  getFileLanguage,
} from '@kie-tools/serverless-workflow-language-service/dist/api';
import {
  SwfJsonLanguageService,
  SwfYamlLanguageService,
} from '@kie-tools/serverless-workflow-language-service/dist/channel';
import { SwfTextEditorController } from '@kie-tools/serverless-workflow-text-editor';
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { IDisposable } from 'monaco-editor';

import {
  initAugmentationCommands,
  initJsonCodeLenses,
} from './new-editor-codelenses';
import { initCompletion } from './new-editor-completion';
import { NewEditorChart } from './WorkflowEditorChart/NewEditorChart';

const initMonaco = () => {
  if (!window.MonacoEnvironment?.getWorker) {
    // @ts-ignore
    window.MonacoEnvironment = {
      getWorker(_, label) {
        switch (label) {
          case 'editorWorkerService':
            return new Worker(
              new URL(
                'monaco-editor/esm/vs/editor/editor.worker',
                import.meta.url,
              ),
            );
          case 'css':
          case 'less':
          case 'scss':
            return new Worker(
              new URL(
                'monaco-editor/esm/vs/language/css/css.worker',
                import.meta.url,
              ),
            );
          case 'handlebars':
          case 'html':
          case 'razor':
            return new Worker(
              new URL(
                'monaco-editor/esm/vs/language/html/html.worker',
                import.meta.url,
              ),
            );
          case 'json':
            return new Worker(
              new URL(
                'monaco-editor/esm/vs/language/json/json.worker',
                import.meta.url,
              ),
            );
          case 'javascript':
          case 'typescript':
            return new Worker(
              new URL(
                'monaco-editor/esm/vs/language/typescript/ts.worker',
                import.meta.url,
              ),
            );
          case 'yaml':
            return new Worker(
              new URL('monaco-yaml/yaml.worker', import.meta.url),
            );
          default:
            throw new Error(`Unknown label ${label}`);
        }
      },
    };
  }
};

type NewEditorProps = {
  content: string;
  setContent?: (content: string) => void;
  workflowURI: string;
  languageServer: SwfJsonLanguageService | SwfYamlLanguageService;
};

export const NewEditor: React.FC<NewEditorProps> = ({
  content,
  setContent,
  workflowURI,
  languageServer,
}) => {
  React.useEffect(() => {
    initMonaco();
    return () => {
      disposableRef.current?.forEach(d => d.dispose());
      controllerRef.current?.dispose();
    };
  }, []);
  const controllerRef = React.useRef<SwfTextEditorController>();
  const disposableRef = React.useRef<IDisposable[]>([]);

  const [selectedNode, setSelectedNode] = React.useState<string>();
  const [editorDiv, setEditorDiv] = React.useState<HTMLDivElement>();

  const onNodeSelect = React.useCallback(nodeName => {
    setSelectedNode(nodeName);
    controllerRef.current?.moveCursorToNode(nodeName);
  }, []);

  React.useEffect(() => {
    if (editorDiv && !controllerRef.current) {
      controllerRef.current = new SwfTextEditorController(
        content,
        args => setContent?.(args.content),
        getFileLanguage(workflowURI) || FileLanguage.YAML,
        getOperatingSystem(),
        !setContent,
        () => {},
        setSelectedNode,
      );

      const editor = controllerRef.current.show(editorDiv, EditorTheme.LIGHT);

      const commandIds = initAugmentationCommands(editor);

      disposableRef.current.push(
        initJsonCodeLenses(false, commandIds, languageServer),
      );
      disposableRef.current.push(initCompletion(commandIds, languageServer));
    }
  }, [editorDiv]);

  return (
    <Drawer isExpanded isInline>
      <DrawerContent
        panelContent={
          <DrawerPanelContent isResizable defaultSize={'50%'} minSize={'150px'}>
            <NewEditorChart
              content={content}
              selectedNode={selectedNode}
              onNodeSelect={onNodeSelect}
            />
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          <div
            ref={setEditorDiv as React.RefCallback<HTMLDivElement>}
            style={{ width: '100%', height: '40rem' }}
          />
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
