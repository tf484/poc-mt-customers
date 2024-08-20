sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Fragment, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict"

    const STATUSES = { ALL: "all", ACTIVE: "active", INACTIVE: "inactive" }
    return Controller.extend("contexts.controller.ContextList", {
      _createContextDialog: undefined,
      _keys: [],
      _attributes: [],

      onInit: async function () {
        const viewDataModel = new JSONModel()
        this.setModel(viewDataModel, "viewData")
        viewDataModel.setProperty("/statusFilter", STATUSES.ACTIVE)
        if (!this._createContextDialog) {
          this._createContextDialog = await this.loadFragment({
            name: "contexts.view.Context",
          })
        }
      },

      onAfterClose: function () {
        this._createContextDialog.destroy()
        this._createContextDialog = undefined
      },

      openContextDialog: async function () {
        if (!this._createContextDialog) {
          this._createContextDialog = await this.loadFragment({
            name: "contexts.view.Context",
          })
        }
        this._createContextDialog.open()
      },

      onCreateContextDialog: async function () {
        const viewDataModel = this.getModel("viewData")
        viewDataModel.setProperty("/createMode", true)
        this.openContextDialog()
      },

      onEditContextDialog: async function (event) {
        const button = event.getSource()
        const contextID = button.data("contextID")

        const viewDataModel = this.getModel("viewData")
        viewDataModel.setProperty("/createMode", false)

        this.openContextDialog()

        await this.loadContext(contextID)
        const contextType = viewDataModel.getProperty("/contextTypeSelected")

        await this.buildKeysAndAttributeUI(contextType)
      },

      loadContext: async function (contextID) {
        const viewModel = this.getModel()
        const getContextsBindContext = viewModel.bindContext(`/Contexts(${contextID})?$expand=keys,attributes`)
        const context = await getContextsBindContext.requestObject()

        const viewDataModel = this.getModel("viewData")

        viewDataModel.setProperty("/contextID", context.ID)
        viewDataModel.setProperty("/compositeKey", context.compositeKey)
        viewDataModel.setProperty("/externalName", context.externalName)
        viewDataModel.setProperty("/contextTypeSelected", context.contextType_code)
        viewDataModel.setProperty("/contextCategorySelected", context.contextCategory_code)
        viewDataModel.setProperty("/contextDescription", context.description)

        for (const key of context.keys) {
          viewDataModel.setProperty(`/${key.keyName}KeyInput`, key.keyValue)
        }

        for (const attribute of context.attributes) {
          viewDataModel.setProperty(`/${attribute.attributeName}AttributeInput`, attribute.attributeValue)
        }
      },

      onBeforeOpen: function () {
        this.clearKeysAndAttributes()
        this.clearContext()
      },

      clearKeysAndAttributes: function () {
        const viewDataModel = this.getModel("viewData")
        for (const key of this._keys) {
          viewDataModel.setProperty(`/${key}KeyInput`, undefined)
        }

        for (const attribute of this._attributes) {
          viewDataModel.setProperty(`/${attribute}AttributeInput`, undefined)
        }
      },

      clearContext: function () {
        const viewDataModel = this.getModel("viewData")
        viewDataModel.setProperty("/contextID", undefined)
        viewDataModel.setProperty("/compositeKey", undefined)
        viewDataModel.setProperty("/externalName", undefined)
        viewDataModel.setProperty("/contextTypeSelected", undefined)
        viewDataModel.setProperty("/contextCategorySelected", undefined)
        viewDataModel.setProperty("/contextDescription", undefined)
      },

      onContextTypeChange: async function () {
        const viewDataModel = this.getModel("viewData")
        const contextType = viewDataModel.getProperty("/contextTypeSelected")

        await this.buildKeysAndAttributeUI(contextType)
      },

      buildKeysAndAttributeUI: async function (contextType) {
        const viewDataModel = this.getModel("viewData")
        const viewModel = this.getModel()
        const getContextTypeDetailsBindContext = viewModel.bindContext(`/getContextTypeDetails(contextType='${contextType}')`)
        const details = await getContextTypeDetailsBindContext.requestObject()
        this._keys = details.keys
        this._attributes = details.attributes

        const keysPanel = this.byId("keysPanel")
        const attributesPanel = this.byId("attributesPanel")

        keysPanel.removeAllContent()
        attributesPanel.removeAllContent()

        const keyForm = []
        for (const key of this._keys) {
          keyForm.push(new sap.m.Label({ text: key, labelFor: `${key}KeyInput` }))
          const valueInput = new sap.m.Input()
          valueInput.setModel(viewDataModel)
          valueInput.bindValue({ path: `/${key}KeyInput` })
          valueInput.addStyleClass("sapUiSmallMarginBottom")
          valueInput.setEnabled(viewDataModel.getProperty("/createMode"))
          keyForm.push(valueInput)
        }
        keysPanel.addContent(
          new sap.m.VBox({
            items: keyForm,
          })
        )

        const attributesForm = []
        if (this._attributes.length === 0) attributesForm.push(new sap.m.Label({ text: "none" }))
        for (const attribute of this._attributes) {
          attributesForm.push(new sap.m.Label({ text: attribute, labelFor: `${attribute}AttributeInput` }))
          const valueInput = new sap.m.Input()
          valueInput.setModel(viewDataModel)
          valueInput.bindValue({ path: `/${attribute}AttributeInput` })
          valueInput.addStyleClass("sapUiSmallMarginBottom")
          attributesForm.push(valueInput)
        }
        attributesPanel.addContent(
          new sap.m.VBox({
            items: attributesForm,
          })
        )
      },

      closeContextDialog: function () {
        this._createContextDialog && this._createContextDialog.close()
      },

      onCancel: function () {
        this.closeContextDialog()
      },

      onSearch: function () {
        const viewDataModel = this.getModel("viewData")
        const searchFilter = viewDataModel.getProperty("/searchFilter")

        const table = this.byId("contextsTable")

        const filters = []

        const contextCategoryValues = viewDataModel.getProperty("/contextCategoryFilters") ? viewDataModel.getProperty("/contextCategoryFilters") : []
        for (const contextCategory of contextCategoryValues) {
          filters.push(new Filter({ path: "contextCategory_code", operator: FilterOperator.EQ, value1: contextCategory }))
        }

        const contextTypeValues = viewDataModel.getProperty("/contextTypeFilters") ? viewDataModel.getProperty("/contextTypeFilters") : []
        for (const contextType of contextTypeValues) {
          filters.push(new Filter({ path: "contextType_code", operator: FilterOperator.EQ, value1: contextType }))
        }

        if (viewDataModel.getProperty("/statusFilter") === STATUSES.ACTIVE) {
          filters.push(new Filter({ path: "inactive", operator: FilterOperator.EQ, value1: false }))
        }

        if (viewDataModel.getProperty("/statusFilter") === STATUSES.INACTIVE) {
          filters.push(new Filter({ path: "inactive", operator: FilterOperator.EQ, value1: true }))
        }

        const bindingInfo = table.getBindingInfo("items")
        if (!bindingInfo.parameters) {
          bindingInfo.parameters = {}
        }
        bindingInfo.parameters.$search = searchFilter
        bindingInfo.filters = filters
        table.bindItems(bindingInfo)
      },

      onRefresh: function () {
        const table = this.byId("contextsTable")
        table.getBinding("items").refresh()
      },

      onClearFilter: function () {
        const viewDataModel = this.getModel("viewData")
        viewDataModel.setProperty("/searchFilter", "")
        viewDataModel.setProperty("/contextCategoryFilters", [])
        viewDataModel.setProperty("/contextTypeFilters", [])
        viewDataModel.setProperty("/statusFilter", STATUSES.ALL)
        this.onSearch()
      },

      onConfirmContext: async function () {
        const viewDataModel = this.getModel("viewData")
        const createMode = viewDataModel.getProperty("/createMode")

        if (createMode) {
          await this.onCreateContext()
        } else {
          await this.onUpdateContext()
        }
      },

      onCreateContext: async function () {
        try {
          const viewDataModel = this.getModel("viewData")

          const contextType = viewDataModel.getProperty("/contextTypeSelected")

          const description = viewDataModel.getProperty("/contextDescription")
          const locale = sap.ui.getCore().getConfiguration().getLanguage()
          const descriptions = [{ locale, description }]

          const keys = []
          for (const key of this._keys) {
            const keyName = key
            const keyValue = viewDataModel.getProperty(`/${key}KeyInput`)
            keys.push({ keyName, keyValue })
          }

          const attributes = []
          for (const attribute of this._attributes) {
            const attributeName = attribute
            const attributeValue = viewDataModel.getProperty(`/${attribute}AttributeInput`)
            attributes.push({ attributeName, attributeValue })
          }

          const viewModel = this.getModel()
          const createContextBindContext = viewModel.bindContext(`/createContext(...)`)
          createContextBindContext.setParameter("contextType", contextType)
          createContextBindContext.setParameter("descriptions", descriptions)
          createContextBindContext.setParameter("keys", keys)
          createContextBindContext.setParameter("attributes", attributes)

          await createContextBindContext.execute()
          const compositeKey = await createContextBindContext.requestObject("compositeKey")
          this.closeContextDialog()
          this.onRefresh()
          MessageToast.show(`Context ${compositeKey} created successfully`)
        } catch (error) {
          MessageBox.show(error.message, {
            icon: MessageBox.Icon.ERROR,
            title: "Create Context Error",
            actions: [MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          })
        }
      },

      onUpdateContext: async function () {
        try {
          const viewDataModel = this.getModel("viewData")

          const contextID = viewDataModel.getProperty("/contextID")

          const description = viewDataModel.getProperty("/contextDescription")
          const locale = sap.ui.getCore().getConfiguration().getLanguage()
          const descriptions = [{ locale, description }]

          const attributes = []
          for (const attribute of this._attributes) {
            const attributeName = attribute
            const attributeValue = viewDataModel.getProperty(`/${attribute}AttributeInput`)
            attributes.push({ attributeName, attributeValue })
          }

          const viewModel = this.getModel()
          const updateContextBindContext = viewModel.bindContext(`/updateContext(...)`)
          updateContextBindContext.setParameter("contextID", contextID)
          updateContextBindContext.setParameter("descriptions", descriptions)
          updateContextBindContext.setParameter("attributes", attributes)

          await updateContextBindContext.execute()
          const compositeKey = viewDataModel.getProperty("/compositeKey")
          MessageToast.show(`Context ${compositeKey} updated successfully`)
          this.closeContextDialog()
          this.onRefresh()
        } catch (error) {
          MessageBox.show(error.message, {
            icon: MessageBox.Icon.ERROR,
            title: "Update Context Error",
            actions: [MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          })
        }
      },

      onToggleStatus: async function (event) {
        try {
          const button = event.getSource()
          const contextID = button.data("contextID")
          const compositeKey = button.data("compositeKey")
          const viewModel = this.getModel()
          const toggleActiveBindContext = viewModel.bindContext(`/toggleStatus(...)`)
          toggleActiveBindContext.setParameter("contextID", contextID)

          await toggleActiveBindContext.execute()
          const inactive = await toggleActiveBindContext.requestObject("inactive")

          this.onRefresh()

          let successMessage = ""
          if (inactive) {
            successMessage = `Context ${compositeKey} Inactivated successfully`
          } else {
            successMessage = `Context ${compositeKey} Activated successfully`
          }
          MessageToast.show(successMessage)
        } catch (error) {
          MessageBox.show(error.message, {
            icon: MessageBox.Icon.ERROR,
            title: "Create Context Error",
            actions: [MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          })
        }
      },

      getModel: function (sName) {
        return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName)
      },

      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName)
      },
    })
  }
)
