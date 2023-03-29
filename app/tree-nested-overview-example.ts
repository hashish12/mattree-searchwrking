import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {  Injectable, AfterViewInit } from '@angular/core';


/**
 * Vehicle data with nested structure.
 * Each node has a name and an optiona list of children.
 */
interface VehicleNode {
  name: string;
  id?: number;
  children?: VehicleNode[];
  selected?: boolean;
  indeterminate?: boolean;
  parent?: VehicleNode;
}

const TREE_DATA: VehicleNode[] = [
  {
    name: 'Infiniti',
    children: [
      {
        name: 'G50',
        children: [
          { name: 'Pure AWD', id: 1 },
          { name: 'Luxe', id: 2 },
        ],
      },
      {
        name: 'QX50',
        children: [
          { name: 'Pure AWD', id: 3 },
          { name: 'Luxe', id: 4 },
        ],
      },
    ],
  },
  {
    name: 'BMW',
    children: [
      {
        name: '2 Series',
        children: [
          { name: 'Coupé', id: 5 },
          { name: 'Gran Coupé', id: 6,selected: true },
        ],
      },
      {
        name: '3 Series',
        children: [
          { name: 'Sedan', id: 7 },
          { name: 'PHEV', id: 8 },
        ],
      },
    ],
  },
];

/**
 * @title Tree with nested nodes
 */
@Component({
  selector: 'tree-nested-overview-example',
  templateUrl: 'tree-nested-overview-example.html',
  styleUrls: ['tree-nested-overview-example.css'],
})
export class TreeNestedOverviewExample {
  
  public treeControl = new NestedTreeControl<VehicleNode>(
    (node) => node.children
  );
  public dataSource = new MatTreeNestedDataSource<VehicleNode>();
  @ViewChild('outputDiv', { static: false })
  public outputDivRef: ElementRef<HTMLParagraphElement>;
  public searchString = '';
  public showOnlySelected = false;

  constructor() {
    this.dataSource.data = TREE_DATA;
    Object.keys(this.dataSource.data).forEach((key) => {
      this.setParent(this.dataSource.data[key], null);
    });
  }
  
  public hasChild = (_: number, node: VehicleNode) =>
    !!node.children && node.children.length > 0;

  private setParent(node: VehicleNode, parent: VehicleNode) {
    node.parent = parent;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.setParent(childNode, node);
      });
    }
  }

  private checkAllParents(node: VehicleNode) {
    if (node.parent) {
      const descendants = this.treeControl.getDescendants(node.parent);
      node.parent.selected = descendants.every((child) => child.selected);
      node.parent.indeterminate = descendants.some((child) => child.selected);
      this.checkAllParents(node.parent);
    }
  }

  private itemToggle(checked: boolean, node: VehicleNode) {
    node.selected = checked;
    if (node.children) {
      node.children.forEach((child) => {
        // this.itemToggle(checked, child);
      });
    }
    this.checkAllParents(node);
  }

  public submit() {
    let result = this.dataSource.data.reduce(
      (acc: string[], node: VehicleNode) =>
        acc.concat(
          this.treeControl
            .getDescendants(node)
            .filter(node => 
              // This is the line to select the leaf only 
              // (node.children == null || node.children.length === 0) &&
               node.selected
              && !this.hideLeafNode(node))
            .map((descendant) => descendant.name)
        ),
      [] as string[]
    );

    this.outputDivRef.nativeElement.innerText =
      'You ' +
      (result.length > 0
        ? 'selected ' + result.join(', ')
        : 'have not made a selection') +
      '.';
  }
  
  public hideLeafNode(node: VehicleNode): boolean {
    return new RegExp(this.searchString, 'i').test(node.name) === false;
  }

  public hideParentNode(node: VehicleNode): boolean {
    if (
      !this.searchString ||
      node.name.toLowerCase().indexOf(this.searchString?.toLowerCase()) !==
        -1
    ) {
      return false
    }
    const descendants = this.treeControl.getDescendants(node)

    if (
      descendants.some(
        (descendantNode) =>
          descendantNode.name
            .toLowerCase()
            .indexOf(this.searchString?.toLowerCase()) !== -1
      )
    ) {
      return false
    }

    return true
  }
  
}
