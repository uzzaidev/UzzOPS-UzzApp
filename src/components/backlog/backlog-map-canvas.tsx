'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type OnNodeDrag,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ClusterNode } from './cluster-node';
import { FeatureNode } from './feature-node';
import { useUpdateCluster, useMoveFeatureToCluster, useCreateDependency } from '@/hooks/useBacklogMap';
import type { BacklogMapData } from '@/types';

const nodeTypes = {
  cluster: ClusterNode,
  feature: FeatureNode,
};

interface Props {
  data: BacklogMapData;
  projectId: string;
}

export function BacklogMapCanvas({ data, projectId }: Props) {
  const updateCluster = useUpdateCluster();
  const moveFeature = useMoveFeatureToCluster();
  const createDependency = useCreateDependency();

  const buildNodes = useCallback((): Node[] => {
    const clusterNodes: Node[] = data.clusters.map((cluster) => ({
      id: `cluster-${cluster.id}`,
      type: 'cluster',
      position: { x: cluster.position_x, y: cluster.position_y },
      data: cluster as unknown as Record<string, unknown>,
      style: { width: 320, minHeight: 180 },
    }));

    const featureNodes: Node[] = data.features.map((feature) => {
      const inCluster = !!feature.cluster_id;
      return {
        id: `feature-${feature.id}`,
        type: 'feature',
        position: inCluster
          ? { x: feature.cluster_position_x ?? 20, y: feature.cluster_position_y ?? 20 }
          : { x: 50 + Math.random() * 400, y: 50 + Math.random() * 300 },
        parentId: inCluster ? `cluster-${feature.cluster_id}` : undefined,
        extent: inCluster ? ('parent' as const) : undefined,
        data: feature as unknown as Record<string, unknown>,
      };
    });

    return [...clusterNodes, ...featureNodes];
  }, [data]);

  const buildEdges = useCallback((): Edge[] => {
    return data.dependencies.map((dep) => ({
      id: dep.id,
      source: `feature-${dep.feature_id}`,
      target: `feature-${dep.depends_on_id}`,
      label: dep.dependency_type === 'blocks' ? 'bloqueia' : dep.dependency_type === 'relates_to' ? 'relaciona' : 'duplica',
      type: dep.dependency_type === 'blocks' ? 'step' : 'default',
      animated: dep.dependency_type === 'blocks',
      style: {
        stroke: dep.dependency_type === 'blocks' ? '#ef4444' : dep.dependency_type === 'relates_to' ? '#3b82f6' : '#f59e0b',
      },
    }));
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges());

  useEffect(() => {
    setNodes(buildNodes());
    setEdges(buildEdges());
  }, [data, buildNodes, buildEdges, setNodes, setEdges]);

  const onNodeDragStop: OnNodeDrag = useCallback((_, node) => {
    if (node.type === 'cluster') {
      updateCluster.mutate({
        clusterId: node.id.replace('cluster-', ''),
        updates: { position_x: node.position.x, position_y: node.position.y },
      });
    } else if (node.type === 'feature') {
      const featureId = node.id.replace('feature-', '');
      const clusterId = node.parentId?.replace('cluster-', '') ?? null;
      moveFeature.mutate({
        featureId,
        clusterId,
        position: { x: node.position.x, y: node.position.y },
      });
    }
  }, [updateCluster, moveFeature]);

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (!connection.source.startsWith('feature-') || !connection.target.startsWith('feature-')) return;

    const featureId = connection.source.replace('feature-', '');
    const dependsOnId = connection.target.replace('feature-', '');

    createDependency.mutate({ featureId, dependsOnId, dependencyType: 'blocks', projectId });
    setEdges((eds) => addEdge(connection, eds));
  }, [createDependency, projectId, setEdges]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background gap={16} color="#e5e7eb" />
        <Controls />
        <MiniMap zoomable pannable />
        <Panel position="bottom-center" className="text-xs text-muted-foreground bg-white/80 px-3 py-1 rounded shadow">
          Arraste features entre clusters · Conecte features para criar dependências
        </Panel>
      </ReactFlow>
    </div>
  );
}
