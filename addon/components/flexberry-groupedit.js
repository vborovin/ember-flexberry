/**
  @module ember-flexberry
*/

import Ember from 'ember';
import FlexberryBaseComponent from './flexberry-base-component';
import Information from 'ember-flexberry-data/utils/information';
import { translationMacro as t } from 'ember-i18n';
import getProjectionByName from '../utils/get-projection-by-name';

/**
  Component for create, edit and delete detail objects.

  @example
  In order to add component following template can be used:
  ```handlebars
  {{flexberry-groupedit
   componentName="userVotesGroupEdit"
   modelProjection=modelProjection.attributes.userVotes
   content=model.userVotes
   readonly=readonly
   orderable=false
  }}
  ```

  @class FlexberryGroupeditComponent
  @extends FlexberryBaseComponent
*/
export default FlexberryBaseComponent.extend({

  /**
    Ember data store.

    @property store
    @type Service
  */
  store: Ember.inject.service('store'),

  /**
    Service that triggers {{#crossLink "FlexberryGroupeditComponent"}}{{/crossLink}} events.

    @property _groupEditEventsService
    @type Service
    @private
  */
  _groupEditEventsService: Ember.inject.service('objectlistview-events'),

  /**
    Name of action to handle row click.
    Action will be send out of the component.

    @property action
    @type String
    @default 'groupEditRowClick'
  */
  action: 'groupEditRowClick',

  /**
    Flag: indicates whether allow to resize columns (if `true`) or not (if `false`).

    If {{#crossLink "UserSettingsService"}}{{/crossLink}} is enabled then saved widths of columns are displayed on component.

    @property allowColumnResize
    @type Boolean
    @default true
  */
  allowColumnResize: true,

  /**
    Classes for buttons (both toolbar and inrow buttons).

    @property buttonClass
    @type String
  */
  buttonClass: undefined,

  /**
    Default cell component that will be used to display values in columns cells.

    @property {Object} cellComponent
    @property {String} [cellComponent.componentName=undefined]
    @property {String} [cellComponent.componentProperties=null]
  */
  cellComponent: {
    componentName: undefined,
    componentProperties: null
  },

  /**
    Content to be displayed (models collection).

    @property content
    @type DS.ManyArray
    @default null
  */
  content: null,

  /**
    Flag: indicates whether to show creation button at toolbar.

    @property createNewButton
    @type Boolean
    @default true
  */
  createNewButton: true,

  /**
    Array of custom buttons of special structures [{ buttonName: ..., buttonAction: ..., buttonClasses: ... }, {...}, ...].

    @example
      ```
      {
        buttonName: '...', // Button displayed name.
        buttonAction: '...', // Action that is called from controller on this button click (it has to be registered at component).
        buttonClasses: '...', // Css classes for button.
        buttonTitle: '...', // Button title.
        iconClasses: '' // Css classes for icon.
        disabled: true, // The state of the button is disabled if `true` or enabled if `false`.
      }
      ```

    @property customButtons
    @type Array
  */
  customButtons: undefined,

  /**
    Custom classes for table.

    @property customTableClass
    @type String
    @default ''
  */
  customTableClass: '',

  /**
    Flag: indicates whether to show delete button at toolbar.

    @property deleteButton
    @type Boolean
    @default true
  */
  deleteButton: true,

  /**
    Flag: indicates whether to show default settings button at toolbar.

    @property defaultSettingsButton
    @type Boolean
    @default true
  */
  defaultSettingsButton: true,

  /**
    Flag indicates whether to show button fo default sorting set.

    @property defaultSortingButton
    @type Boolean
    @default true
  */
  defaultSortingButton: true,

  /**
    Route of edit form.

    @example
    This form is opened after row click
    if flag {{#crossLink "FlexberryGroupeditComponent/editOnSeparateRoute:property"}}{{/crossLink}} is enabled.

    @property editFormRoute
    @type String
  */
  editFormRoute: undefined,

  /**
    Flag: indicates whether records should be edited on separate route.

    @example
    In order to enable properly editing in separate route following properties have to be defined:
    - {{#crossLink "FlexberryGroupeditComponent/editOnSeparateRoute:property"}}{{/crossLink}} has to be set as true,
    - {{#crossLink "FlexberryGroupeditComponent/rowClickable:property"}}{{/crossLink}} has to be set as true,
    - {{#crossLink "FlexberryGroupeditComponent/editFormRoute:property"}}{{/crossLink}} has to be set,
    - {{#crossLink "FlexberryGroupeditComponent/saveBeforeRouteLeave:property"}}{{/crossLink}} can be set.

    ```handlebars
    { {flexberry-groupedit
      ...
      editOnSeparateRoute=true
      rowClickable=true
      rowClick='rowClick'
      editFormRoute=commentsEditRoute
      saveBeforeRouteLeave=needSaveBeforeRouteLeave
      ...
    } }
    ```

    @property editOnSeparateRoute
    @type Boolean
    @default false
  */
  editOnSeparateRoute: false,

  /**
    Additional menu items for dropdown menu in last column of every row.

    @example
      ```javascript
      // app/controllers/exapmle.js
      ...
      menuItems: [{
        icon: 'spy icon',
        title: 'Recruit it',
        actionName: 'recruit',
      }],
      ...
      actions: {
        ...
        recruit(record) {
          record.set('isSpy', true);
        },
        ...
      },
      ...
      ```

      Note: For every action in component you need to pass an additional parameter in the form of `actionName="actionName"`.
      ```javascript
      // app/templates/example.hbs
      ...
      {{flexberry-groupedit
        ...
        menuInRowAdditionalItems=menuItems
        recruit="recruit"
        ...
      }}
      ...
      ```

    For in-row menu following properties are used:
    - {{#crossLink "FlexberryGroupeditComponent/showDeleteMenuItemInRow:property"}}{{/crossLink}},
    - {{#crossLink "FlexberryGroupeditComponent/showEditMenuItemInRow:property"}}{{/crossLink}},
    - {{#crossLink "FlexberryGroupeditComponent/menuInRowAdditionalItems:property"}}{{/crossLink}}.

    @property menuInRowAdditionalItems
    @type Array
    @default null
  */
  menuInRowAdditionalItems: null,

  /**
    Model projection which should be used to display given content.
    Properties of objects by model projection are displayed on component.

    @property modelProjection
    @type Object
    @default null
  */
  modelProjection: null,

  /**
    Main model projection. Accepts object projections.
    Needs for support locales of captions.

    @property mainModelProjection
    @type Object
  */
  mainModelProjection: undefined,

  /**
    Flag indicates whether ordering by clicking on column headers is allowed.

    @example
    If sorting is used then there has to be declaration:
    ```handlebars
     {{flexberry-groupedit
       ...
       orderable=true
       sorting=computedSorting
       sortByColumn=(action "sortByColumn")
       addColumnToSorting=(action "addColumnToSorting")}}
    ```

    @property orderable
    @type Boolean
    @default false
  */
  orderable: false,

  /**
   Text to be displayed in table body, if content is not defined or empty.

   @property placeholder
   @type String
   @default t('components.flexberry-groupedit.placeholder')
  */
  placeholder: t('components.flexberry-groupedit.placeholder'),

  /**
    Flag indicates whether table rows are clickable (action will be fired after row click).

    @property rowClickable
    @type Boolean
    @default false
  */
  rowClickable: false,

  /**
    Flag indicates whether to save current model before going to the detail's route.

    @example
    This flag is used when flag {{#crossLink "FlexberryGroupeditComponent/editOnSeparateRoute:property"}}{{/crossLink}} is enabled.

    @property saveBeforeRouteLeave
    @type Boolean
    @default false
  */
  saveBeforeRouteLeave: false,

  /**
    Flag indicates whether to look for changes of model (and displaying corresponding changes on control) or not.

    If flag is enabled component compares current detail array with used on component,
    removes deleted and marked as deleted on model level records, adds created on model level records.

    @property searchForContentChange
    @type Boolean
    @default true
  */
  searchForContentChange: true,

  /**
    Flag: indicates whether to show validation messages in every row or not.

    @property showValidationMessages
    @type Boolean
    @default false
  */
  showValidationMessagesInRow: true,

  /**
    Flag: indicates whether to show asterisk icon in first column of every changed row.

    @property showAsteriskInRow
    @type Boolean
    @default true
  */
  showAsteriskInRow: true,

  /**
    Flag: indicates whether to show checkbox in first column of every row.

    @property showCheckBoxInRow
    @type Boolean
    @default true
  */
  showCheckBoxInRow: true,

  /**
    Flag: indicates whether to show delete button in first column of every row.

    @property showDeleteButtonInRow
    @type Boolean
    @default false
  */
  showDeleteButtonInRow: false,

  /**
    Flag: indicates whether to show dropdown menu with delete menu item, in last column of every row.

    For in-row menu following properties are used:
    - {{#crossLink "FlexberryGroupeditComponent/showDeleteMenuItemInRow:property"}}{{/crossLink}},
    - {{#crossLink "FlexberryGroupeditComponent/showEditMenuItemInRow:property"}}{{/crossLink}},
    - {{#crossLink "FlexberryGroupeditComponent/menuInRowAdditionalItems:property"}}{{/crossLink}}.

    @property showDeleteMenuItemInRow
    @type Boolean
    @default false
  */
  showDeleteMenuItemInRow: false,

  /**
    Flag: indicates whether to show dropdown menu with edit menu item, in last column of every row.

    For in-row menu following properties are used:
    - {{#crossLink "FlexberryGroupeditComponent/showDeleteMenuItemInRow:property"}}{{/crossLink}},
    - {{#crossLink "FlexberryGroupeditComponent/showEditMenuItemInRow:property"}}{{/crossLink}},
    - {{#crossLink "FlexberryGroupeditComponent/menuInRowAdditionalItems:property"}}{{/crossLink}}.

    @property showEditMenuItemInRow
    @type Boolean
    @default false
  */
  showEditMenuItemInRow: false,

  /**
    Array with sorting data.

    @property sorting
    @type Object
    @default null
  */
  sorting: null,

  /**
    Flag: indicates whether table are striped.

    @property tableStriped
    @type Boolean
    @default true
  */
  tableStriped: true,

  /**
    Minimum column width, if width isn't defined in userSettings.

    @property minAutoColumnWidth
    @type Number
    @default 100
  */
  minAutoColumnWidth: 100,

  /**
    Indicates whether or not autoresize columns for fit the page width.

    @property columnsWidthAutoresize
    @type Boolean
    @default true
  */
  columnsWidthAutoresize: true,

  /**
    List of component names, which can overflow table cell.

    @property overflowedComponents
    @type Array
    @default Ember.A(['flexberry-dropdown', 'flexberry-lookup'])
  */
  overflowedComponents: Ember.A(['flexberry-dropdown', 'flexberry-lookup']),

  /**
    Flag indicates whether to fix the table head (if `true`) or not (if `false`).

    @property fixedHeader
    @type Boolean
    @default true
  */
  fixedHeader: false,

  actions: {
    /**
      Handles action from object-list-view when no handler for this component is defined.

      @method actions.sortByColumn
      @param {Object} column Column to sort by.
    */
    sortByColumn(column) {
      let sortAscending = column.sortAscending;
      let columnName = column.propName;
      let attributePath = columnName;
      if (Ember.get(column, 'cellComponent.componentName') === 'flexberry-lookup') {
        let diplayAttribute = Ember.get(column, 'cellComponent.componentProperties.displayAttributeName');
        attributePath += diplayAttribute ? `.${diplayAttribute}` : '';
      }

      if (Ember.isNone(sortAscending)) {
        this.set('sorting', [{ propName: columnName, direction: 'asc', attributePath: attributePath }]);
      } else if (sortAscending) {
        this.set('sorting', [{ propName: columnName, direction: 'desc', attributePath: attributePath }]);
      } else {
        this.set('sorting', []);
      }
    },

    /**
      Handles action from object-list-view when no handler for this component is defined.

      @method actions.addColumnToSorting
      @param {Object} column Column to add sorting by.
    */
    addColumnToSorting(column) {
      let sortAscending = column.sortAscending;
      let columnName = column.propName;
      let attributePath = columnName;
      if (Ember.get(column, 'cellComponent.componentName') === 'flexberry-lookup') {
        let diplayAttribute = Ember.get(column, 'cellComponent.componentProperties.displayAttributeName');
        attributePath += diplayAttribute ? `.${diplayAttribute}` : '';
      }

      let sorting = Ember.copy(this.get('sorting'), true) || [];
      for (let i = 0; i < sorting.length; i++) {
        if (sorting[i].propName === 'id') {
          sorting.splice(i, 1);
          break;
        }
      }

      if (Ember.isNone(sortAscending)) {
        sorting.push({ propName: columnName, direction: 'asc', attributePath: attributePath });
        this.set('sorting', sorting);
        this.sortingFunction();
      } else if (sortAscending) {
        for (let i = 0; i < sorting.length; i++) {
          if (sorting[i].propName === columnName) {
            sorting[i].direction = 'desc';
            break;
          }
        }

        this.set('sorting', sorting);
        this.sortingFunction();
      } else {
        for (let i = 0; i < sorting.length; i++) {
          if (sorting[i].propName === columnName) {
            sorting.splice(i, 1);
            sorting.push({ propName: 'id', direction: 'asc' });
            break;
          }
        }

        this.set('sorting', sorting);
        this.sortingFunction();
      }
    },

    /**
      Handles click on row of component.
      Sends primary action out of component.

      @method actions.groupEditRowClick
      @param {Object} record Clicked record.
      @param {Object} options Different parameters to handle action.
    */
    groupEditRowClick(record, options) {
      if (this.get('editOnSeparateRoute')) {
        let editFormRoute = this.get('editFormRoute');
        Ember.assert('Edit form route must be defined for flexberry-groupedit', editFormRoute);
        options = Ember.merge(options, { editFormRoute: editFormRoute });
      }

      this.sendAction('action', record, options);
    },

    /**
      Send action with `actionName` into controller.

      @method actions.sendMenuItemAction
      @param {String} actionName
      @param {DS.Model} record
    */
    sendMenuItemAction(actionName, record) {
      this.sendAction(actionName, record);
    },

    /**
      Handler to get user button's actions and send action to corresponding controllers's handler.
      @method actions.customButtonAction
      @public
      @param {String} actionName The name of action
    */
    customButtonAction: function customButtonAction(actionName) {
      if (!actionName) {
        throw new Error('No handler for custom button of flexberry-groupedit toolbar was found.');
      }

      this.sendAction(actionName);
    },
  },

  sortingObserver: Ember.observer('sorting', function() {
    this.sortingFunction();
  }),

  /**
    Check in view order property.

    @property orderedProperty
    @type computed
  */
  orderedProperty: Ember.computed('modelProjection', function() {
    let projection = this.get('modelProjection');
    if (typeof projection === 'string') {
      let modelName = this.get('modelName');
      projection = getProjectionByName(projection, modelName, this.get('store'));
    }

    if (Ember.isNone(projection)) {
      return;
    }

    let information = new Information(this.get('store'));
    let attributes = projection.attributes;
    let attributesKeys = Object.keys(attributes);

    let order = attributesKeys.find((key) => {
      let attrubute = attributes[key];
      if (attrubute.kind === 'attr' && information.isOrdered(projection.modelName, key)) {
        this.set('sorting', [{ direction: 'asc', propName: key }]);
        return key;
      }
    });

    return order;
  }),

  /**
    Sorting records and trigger `geSortApply` action.

    @method sortingFunction
  */
  sortingFunction() {
    let records = this.get('content');
    if (Ember.isArray(records) && records.length > 1) {
      let sorting = this.get('sorting') || [];
      if (sorting.length === 0) {
        sorting = [{ propName: 'id', direction: 'asc' }];
      }

      for (let i = 0; i < sorting.length; i++) {
        let sort = sorting[i];
        if (i === 0) {
          records = this.sortRecords(records, sort, 0, records.length - 1);
        } else {
          let index = 0;
          for (let j = 1; j < records.length; j++) {
            for (let sortIndex = 0; sortIndex <  i; sortIndex++) {
              if (records.objectAt(j).get(sorting[sortIndex].propName) !== records.objectAt(j - 1).get(sorting[sortIndex].propName)) {
                records = this.sortRecords(records, sort, index, j - 1);
                index = j;
                break;
              }
            }
          }

          records = this.sortRecords(records, sort, index, records.length - 1);
        }
      }

      this.set('content', records);
    }

    let componentName = this.get('componentName');
    this.get('_groupEditEventsService').geSortApplyTrigger(componentName, this.get('sorting'));
  },

  /**
    Client-side sorting for groupEdit content.

    @method sortRecords
    @param {Array} records Records for sorting.
    @param {Object} sortDef Sorting definition.
    @param {Int} start First index in records.
    @param {Int} end Last index in records.
    @return {Array} Sorted records.
  */
  sortRecords(records, sortDef, start, end) {
    let recordsSort = records;
    if (start >= end) {
      return recordsSort;
    }

    // Form hash array (there can be different observers on recordsSort changing, so it is better to minimize such changes).
    let hashArray = [];
    for (let i = start; i <= end; i++) {
      let currentRecord = recordsSort.objectAt(i);
      let currentHash = currentRecord.get(sortDef.attributePath || sortDef.propName);
      let hashStructure = {
        record: currentRecord,
        hash: currentHash
      };

      hashArray.push(hashStructure);
    }

    let hashArrayLength = hashArray.length;

    // Compare record with number koef1 and koef2.
    // It returns true if records should be exchanged.
    let condition = function(koef1, koef2) {
      let firstProp = hashArray[koef1].hash;
      let secondProp = hashArray[koef2].hash;
      if (sortDef.direction === 'asc') {
        return Ember.isNone(secondProp) && !Ember.isNone(firstProp) ? true : firstProp > secondProp;
      }

      if (sortDef.direction === 'desc') {
        return !Ember.isNone(secondProp) && Ember.isNone(firstProp) ? true : firstProp < secondProp;
      }

      return false;
    };

    // Sort with minimum exchanges.
    for(let i = 0; i < hashArrayLength; i++) {
      // Find minimum in right not sorted part.
      let min = i;
      for(let j = i + 1; j < hashArrayLength; j++) {
        if(condition(min, j)) {
          min = j; 
        }
      }
      if (min != i) {
        // Exchange current with minimum.
        let tmp = hashArray[i]; 
        hashArray[i] = hashArray[min];
        hashArray[min] = tmp;      
      }
    }
    
    // Remove unsorted part.
    recordsSort.removeAt(start, end - start + 1);

    // Insert sorted elements.
    for (let i = start; i <= end; i++) {
      recordsSort.insertAt(i, hashArray[i-start].record);
    }

    return recordsSort;
  },

  didInsertElement() {
    this._super(...arguments);

    if (Ember.isNone(this.get('orderedProperty'))) {
      let developerUserSettings = this.currentController;
      developerUserSettings = developerUserSettings ? developerUserSettings.get('developerUserSettings') || {} : {};
      developerUserSettings = developerUserSettings[this.componentName] || {};
      developerUserSettings = developerUserSettings.DEFAULT || {};
      this.set('sorting', developerUserSettings.sorting || []);
    }
  },

  /**
    Hook that can be used to confirm delete row.

    @example
      ```javascript
      // app/controllers/example.js
      ...
      actions: {
        ...
        confirmDeleteRow(record) {
          return new Promise((resolve, reject) => {
            this.showConfirmDialg({
              title: `Delete an object with the ID '${record.get('id')}'?`,
              onApprove: resolve,
              onDeny: reject,
            });
          });
        }
        ...
      }
      ...
      ```

      ```handlebars
      <!-- app/templates/example.hbs -->
      {{flexberry-objectlistview
        ...
        confirmDeleteRow=(action "confirmDeleteRow")
        ...
      }}
      ```

    @method confirmDeleteRow
    @param {DS.Model} record The record to be deleted.
    @return {Boolean|Promise} If `true`, then delete row, if `Promise`, then delete row after successful resolve, else cancel.
  */
  confirmDeleteRow: undefined,

  /**
    Hook that can be used to confirm delete rows.

    @example
      ```javascript
      // app/controllers/example.js
      ...
      actions: {
        ...
        confirmDeleteRows() {
          return new Promise((resolve, reject) => {
            this.showConfirmDialg({
              title: 'Delete all selected records?',
              onApprove: resolve,
              onDeny: reject,
            });
          });
        }
        ...
      }
      ...
      ```

      ```handlebars
      <!-- app/templates/example.hbs -->
      {{flexberry-objectlistview
        ...
        confirmDeleteRows=(action "confirmDeleteRows")
        ...
      }}
      ```

    @method confirmDeleteRows
    @return {Boolean|Promise} If `true`, then delete row, if `Promise`, then delete row after successful resolve, else cancel.
  */
  confirmDeleteRows: undefined,

  /**
    Hook that executes before deleting the record.

    @example
      ```handlebars
      <!-- app/templates/employees.hbs -->
      {{flexberry-groupedit
        ...
        beforeDeleteRecord=(action 'beforeDeleteRecord')
        ...
      }}
      ```

      ```javascript
      // app/controllers/employees.js
      import ListFormController from './list-form';

      export default ListFormController.extend({
        actions: {
          beforeDeleteRecord(record, data) {
            if (record.get('myProperty')) {
              data.cancel = true;
            }
          }
        }
      });
      ```

    @method beforeDeleteRecord
    @param {DS.Model} record Deleting record.
    @param {Object} data Metadata.
    @param {Boolean} [data.cancel=false] Flag for canceling deletion.
    @param {Boolean} [data.immediately] See {{#crossLink "ObjectListView/immediateDelete:property"}}{{/crossLink}} property for details.
  */
  beforeDeleteRecord: undefined,
});
