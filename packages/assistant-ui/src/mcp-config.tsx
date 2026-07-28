// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file mcp-config.tsx
 * @input Uses consumer-provided MCP server state and Astryx list/actions
 * @output Exports MCPConfig and MCPServerConfig
 * @position Optional MCP configuration presentation boundary
 */

import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {List, ListItem} from '@astryxdesign/core/List';

export interface MCPServerConfig {
  id: string;
  name: string;
  url?: string;
  status?: 'connected' | 'connecting' | 'disconnected' | 'error';
  isEnabled?: boolean;
}

export interface MCPConfigProps {
  servers: MCPServerConfig[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  onToggle?: (id: string, enabled: boolean) => void;
}

function statusVariant(
  status: MCPServerConfig['status'],
): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'connected':
      return 'success';
    case 'connecting':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'neutral';
  }
}

export function MCPConfig({
  servers,
  onAdd,
  onRemove,
  onToggle,
}: MCPConfigProps) {
  return (
    <List density="compact" hasDividers>
      {servers.map(server => (
        <ListItem
          description={server.url}
          endContent={
            <>
              <Badge
                label={server.status ?? 'disconnected'}
                variant={statusVariant(server.status)}
              />
              {onToggle != null && (
                <Button
                  label={server.isEnabled === false ? 'Enable' : 'Disable'}
                  onClick={() =>
                    onToggle(server.id, server.isEnabled === false)
                  }
                  size="sm"
                  variant="ghost"
                />
              )}
              {onRemove != null && (
                <Button
                  label="Remove"
                  onClick={() => onRemove(server.id)}
                  size="sm"
                  variant="ghost"
                />
              )}
            </>
          }
          key={server.id}
          label={server.name}
        />
      ))}
      {onAdd != null && (
        <ListItem
          endContent={
            <Button
              label="Add server"
              onClick={onAdd}
              size="sm"
              variant="secondary"
            />
          }
          label="Model Context Protocol"
        />
      )}
    </List>
  );
}
