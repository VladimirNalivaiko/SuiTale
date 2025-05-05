import { Extension } from '@tiptap/core';
import { PluginKey } from 'prosemirror-state';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';

// Type for the component reference
interface ComponentRef {
  ref: {
    onKeyDown: (props: any) => boolean;
  };
  element: HTMLElement;
  destroy: () => void;
  updateProps: (props: any) => void;
}

// Interface for the Props of the Slash Commands extension
export interface SlashCommandsOptions {
  component: any;
  char: string;
}

export const SlashCommandsPluginKey = new PluginKey('slash-commands');

export const SlashCommands = Extension.create<SlashCommandsOptions>({
  name: 'slashCommands',
  
  addOptions() {
    return {
      component: null,
      char: '/',
    };
  },
  
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: this.options.char,
        command: ({ editor, range, props }) => {
          // This function will be called from SlashCommandsMenu component
          // when a command is selected
          props.command({ editor, range });
        },
        pluginKey: SlashCommandsPluginKey,
        allowSpaces: false,
        startOfLine: false,
        
        items: ({ query }) => {
          // We will handle filtering in the React component
          return [query];
        },
        
        render: () => {
          let component: ComponentRef | null = null;
          let popup: Instance | null = null;
          
          return {
            onStart: (props) => {
              component = new ReactRenderer(this.options.component, {
                props,
                editor: this.editor,
              }) as unknown as ComponentRef;
              
              // Use DOMRect directly instead of custom object
              // @ts-ignore - Type issues with tippy and GetReferenceClientRect
              popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                arrow: false,
                theme: 'dark',
                zIndex: 9999,
                // Fix layout shift by ensuring the popup doesn't affect document flow
                popperOptions: {
                  strategy: 'fixed',
                  modifiers: [
                    {
                      name: 'preventOverflow',
                      options: {
                        altAxis: true,
                        padding: 8,
                      },
                    }
                  ],
                },
              });
            },
            
            onUpdate(props) {
              if (component) {
                component.updateProps(props);
              }
              
              if (popup) {
                // @ts-ignore - Type issues with tippy and GetReferenceClientRect
                popup.setProps({
                  getReferenceClientRect: props.clientRect,
                });
              }
            },
            
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                if (popup) {
                  popup.hide();
                }
                return true;
              }
              
              return component?.ref?.onKeyDown(props) || false;
            },
            
            onExit() {
              if (popup) {
                popup.destroy();
              }
              if (component) {
                component.destroy();
              }
            },
          };
        },
      }),
    ];
  },
}); 