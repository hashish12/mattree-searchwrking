import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {  Injectable, AfterViewInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';


/**
 * Vehicle data with nested structure.
 * Each node has a name and an optiona list of children.
 */
interface VehicleNode {
  name: string;
  id?: number;
  children?: VehicleNode[];
  selected?: boolean;
  disabled?: boolean;
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
          { name: 'Gran Coupé', id: 6 },
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
interface SelectedNode {
  name: string;
  
}

const selectedNodes: Array<SelectedNode> = [{name:'BMW'}, {name:'2 Series'}];



/**
 * @title Tree with nested nodes
 */
@Component({
  selector: 'tree-nested-overview-example',
  templateUrl: 'tree-nested-overview-example.html',
  styleUrls: ['tree-nested-overview-example.css'],
})
export class TreeNestedOverviewExample  implements AfterViewInit{
  treeControl: NestedTreeControl<VehicleNode>;


  

  public dataSource = new MatTreeNestedDataSource<VehicleNode>();
  @ViewChild('outputDiv', { static: false })
  public outputDivRef: ElementRef<HTMLParagraphElement>;
  public searchString = '';
  public showOnlySelected = false;


  ngAfterViewInit() {
  //  this.treeControl.expandAll();
    //console.log(this.treeControl.expandAll());
     for (let i=0; i<this.treeControl.dataNodes.length; i++){
     if (selectedNodes.find (e => e.name === this.treeControl.dataNodes[i].name) ) {
      this.itemToggle(true,this.treeControl.dataNodes[i]);
     }
     if  (this.treeControl.dataNodes[i].children){
         console.log("has children");

        const alldecendents = this.treeControl.getDescendants(this.treeControl.dataNodes[i]);
         console.log(alldecendents);

         for (let j=0; j<alldecendents.length; j++){
          if (selectedNodes.find (e => e.name ===alldecendents[j].name) ) {
           this.itemToggle(true,alldecendents[j]);
          }
       }
  }
  }
 // console.log (this.treeControl.getDescendants(this.treeControl.dataNodes[1])[0].disabled);
 //this.treeControl.collapseAll();

}


  constructor() {
    
    this.treeControl = new NestedTreeControl<VehicleNode>( (node) => node.children);
    this.treeControl.dataNodes=TREE_DATA;
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
      //node.parent.selected = descendants.every((child) => child.selected);
      node.parent.indeterminate = descendants.some((child) => child.selected);
      this.checkAllParents(node.parent);
    }
  }

  private itemToggle(checked: boolean, node: VehicleNode) {
    node.selected = checked;
    // if (node.children) {
    //   node.children.forEach((child) => {
    //      this.itemToggle(checked, child);
    //   });
    // }
    if (node.children) {
    this.itemDisable(checked,node);
    }
    this.checkAllParents(node);
  }

  private itemDisable(checked: boolean, node: VehicleNode){
     const descendants = this.treeControl.getDescendants(node);
     descendants.forEach(node => node.disabled=true);
  }

  public submit() {
   
    let result = this.dataSource.data.reduce(
      (acc: string[], node: VehicleNode) => {
        if (node.selected) {
          acc.push(node.name);
        }
        return acc.concat(
          this.treeControl
            .getDescendants(node)
            .filter(node => node.selected && !this.hideLeafNode(node))
            .map((descendant) => descendant.name)
        );
      },
      [] as string[]
    );

    this.outputDivRef.nativeElement.innerText =
      'You ' +
      (result.length > 0
        ? 'selected ' + result.join(', ')
        : 'have not made a selection') +
      '.';
      
  }
  
  // IF we dont find something we return false 
  public hideLeafNode(node: VehicleNode): boolean {
    return new RegExp(this.searchString, 'i').test(node.name) === false;
  }

  // If we find something we show parent or else if the parents
  //child has the search string value we show the parents
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
