import React, { useMemo } from 'react';

const SankeyChart = ({ applications }) => {
    // Process applications to create proper Sankey data
    const processSankeyData = (apps) => {
        if (!apps || apps.length === 0) {
            return { nodes: [], links: [] };
        }

        const nodes = [];
        const links = [];

        // Count applications by status
        const statusCounts = {};
        apps.forEach(app => {
            statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
        });

        // Create the main "Total Applications" node
        nodes.push({
            id: 'Total',
            name: 'Total Applications',
            value: apps.length,
            level: 0
        });

        // Create nodes for each status that has applications
        const statuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
        statuses.forEach(status => {
            if (statusCounts[status] && statusCounts[status] > 0) {
                nodes.push({
                    id: status,
                    name: status,
                    value: statusCounts[status],
                    level: 1
                });

                // Create link from Total to this status
                links.push({
                    source: 'Total',
                    target: status,
                    value: statusCounts[status]
                });
            }
        });

        // Add "Still Applied" if there are applications with "Applied" status
        if (statusCounts['Applied'] > 0) {
            // Replace "Applied" label with "Still Applied" for clarity
            const appliedNode = nodes.find(n => n.id === 'Applied');
            if (appliedNode) {
                appliedNode.name = 'Still Applied';
            }
        }

        return { nodes, links };
    };

    const sankeyData = useMemo(() => processSankeyData(applications), [applications]);

    // Chart dimensions
    const margin = { top: 20, right: 150, bottom: 20, left: 150 };
    const width = 800;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Node dimensions
    const totalNodeWidth = 100; // Width for Total Applications light blue part
    const statusNodeWidth = 15; // Width for status nodes (same as dark blue bars)
    const nodePadding = 20;

    // Colors for each stage
    const colors = {
        'Total': '#93c5fd', // Light blue for Total Applications
        'Applied': '#94a3b8',
        'Interview': '#10b981',
        'Offer': '#22c55e',
        'Rejected': '#ef4444',
        'Withdrawn': '#a855f7'
    };

    // Calculate node positions
    const nodePositions = useMemo(() => {
        const positions = {};

        // Position the Total node
        const totalNode = sankeyData.nodes.find(n => n.id === 'Total');
        if (totalNode) {
            const totalHeight = (totalNode.value / totalNode.value) * innerHeight * 0.8;
            positions['Total'] = {
                x: 0, // Keep the rectangle at the start of the diagram
                y: (innerHeight - totalHeight) / 2,
                width: totalNodeWidth,
                height: totalHeight
            };
        }

        // Position the status nodes
        const statusNodes = sankeyData.nodes.filter(n => n.level === 1);
        const totalStatusHeight = statusNodes.reduce((sum, node) => {
            return sum + (node.value / applications.length) * innerHeight * 0.8 + nodePadding;
        }, -nodePadding);

        let currentY = (innerHeight - totalStatusHeight) / 2;
        statusNodes.forEach(node => {
            const nodeHeight = Math.max(20, (node.value / applications.length) * innerHeight * 0.8);
            positions[node.id] = {
                x: innerWidth * 0.7, // Back to original position
                y: currentY,
                width: statusNodeWidth,
                height: nodeHeight
            };
            currentY += nodeHeight + nodePadding;
        });

        return positions;
    }, [sankeyData, applications.length, innerHeight, innerWidth]);

    // Create path for links
    const createLinkPath = (link) => {
        const sourcePos = nodePositions[link.source];
        const targetPos = nodePositions[link.target];

        if (!sourcePos || !targetPos) return '';

        // Calculate the vertical position of this link within the source node
        let sourceOffset = 0;
        sankeyData.links.forEach(otherLink => {
            if (otherLink.source === link.source && nodePositions[otherLink.target].y < targetPos.y) {
                sourceOffset += (otherLink.value / applications.length) * innerHeight * 0.8;
            }
        });

        const linkHeight = Math.max(2, (link.value / applications.length) * innerHeight * 0.8);

        const sourceY = sourcePos.y + sourceOffset;
        const targetY = targetPos.y;

        // For Total node, account for the right dark blue bar
        const x0 = link.source === 'Total' ? sourcePos.x + sourcePos.width + 15 : sourcePos.x + sourcePos.width;
        const x1 = targetPos.x;
        const xi = x0 + (x1 - x0) * 0.5;

        // Create the path
        return `
            M ${x0} ${sourceY}
            C ${xi} ${sourceY}, ${xi} ${targetY}, ${x1} ${targetY}
            L ${x1} ${targetY + linkHeight}
            C ${xi} ${targetY + linkHeight}, ${xi} ${sourceY + linkHeight}, ${x0} ${sourceY + linkHeight}
            Z
        `;
    };

    if (!applications || applications.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Flow</h3>
                <p className="text-gray-500 text-center py-8">No applications to display</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Application Flow (Sankey Diagram)
            </h3>

            <svg width={width} height={height} style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Render links */}
                    {sankeyData.links.map((link, index) => {
                        const sourceColor = colors[link.source];
                        const targetColor = colors[link.target];

                        return (
                            <g key={`${link.source}-${link.target}`}>
                                <defs>
                                    <linearGradient
                                        id={`gradient-${index}`}
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor={sourceColor} stopOpacity="0.7" />
                                        <stop offset="100%" stopColor={targetColor} stopOpacity="0.7" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={createLinkPath(link)}
                                    fill={`url(#gradient-${index})`}
                                    stroke="none"
                                    className="hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    <title>{`${link.value} applications to ${link.target}`}</title>
                                </path>
                            </g>
                        );
                    })}

                    {/* Render nodes */}
                    {sankeyData.nodes.map(node => {
                        const pos = nodePositions[node.id];
                        if (!pos) return null;

                        const isTotal = node.id === 'Total';

                        return (
                            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                                {isTotal ? (
                                    // Special rendering for Total Applications with dark blue bars
                                    <>
                                        {/* Left dark blue bar */}
                                        <rect
                                            x={-15}
                                            width={15}
                                            height={pos.height}
                                            fill="#60a5fa"
                                        />
                                        {/* Light blue rectangle */}
                                        <rect
                                            width={pos.width}
                                            height={pos.height}
                                            fill={colors[node.id]}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                        >
                                            <title>{`${node.name}: ${node.value} applications`}</title>
                                        </rect>
                                        {/* Right dark blue bar */}
                                        <rect
                                            x={pos.width}
                                            width={15}
                                            height={pos.height}
                                            fill="#60a5fa"
                                        />
                                    </>
                                ) : (
                                    // Regular rectangle for other nodes
                                    <rect
                                        width={pos.width}
                                        height={pos.height}
                                        fill={colors[node.id]}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                    >
                                        <title>{`${node.name}: ${node.value} applications`}</title>
                                    </rect>
                                )}
                                {isTotal ? (
                                    // Vertical text for Total Applications - positioned in whitespace
                                    <text
                                        x={-25}
                                        y={pos.height / 2}
                                        textAnchor="middle"
                                        className="text-sm font-medium fill-gray-700"
                                        transform={`rotate(-90, -25, ${pos.height / 2})`}
                                    >
                                        {node.name}: {node.value}
                                    </text>
                                ) : (
                                    // Horizontal text for other nodes
                                    <text
                                        x={pos.width + 8}
                                        y={pos.height / 2}
                                        dy="0.35em"
                                        textAnchor="start"
                                        className="text-sm font-medium fill-gray-700"
                                    >
                                        {node.name}: {node.value}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p className="font-medium">Reading the diagram:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>The left rectangle shows your total applications</li>
                    <li>Flows branch out to show current status distribution</li>
                    <li>Flow width represents the number of applications</li>
                    <li>Hover over elements for exact counts</li>
                </ul>
            </div>
        </div>
    );
};

export default SankeyChart;