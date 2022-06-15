Ext.define("CArABU.app.TSApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new CArABU.technicalservices.Logger(),
    defaults: { margin: 10 },
    layout: 'border',

    items: [
        {xtype:'container',flex: 1, itemId:'grid_box1', region: 'west'},
        {xtype:'container',flex: 1, itemId:'grid_box2', region: 'east'}
    ],

    integrationHeaders : {
        name : "CArABU.app.TSApp"
    },

    launch: function () {
        this.add({
            xtype: 'rallygrid',
            columnCfgs: [
                'FormattedID',
                'Name',
                'Projects',
                'Owner'
            ],
            context: this.getContext(),
            enableEditing: false,
            showRowActionsColumn: false,
            storeConfig: {
                model: 'milestone'
            },
            listeners: {
                // scope: this,
                itemclick: function (record, item, index, e, eOpts) {
                    console.log('item', item)
                    var milestone = item;

                    milestone.getCollection('Projects').load({
                        fetch: ['Name'],
                        callback: function (records, operation, success) {
                            console.log('records', records)
                            var myProjects = [];
                            Ext.Array.each(records, function (project) {
                                var projectName = project.get('Name');
                                myProjects.push(projectName)
                            });
                            console.log(myProjects);
                            // this.showDrillDown(records, "my title");
                            var store = Ext.create('Rally.data.custom.Store', {
                                data: myProjects,
                                pageSize: 2000
                            });
                            console.log("store", store)

                            Ext.create('Rally.ui.dialog.Dialog', {
                                id: 'detailPopup',
                                title: 'Name',
                                width: Ext.getBody().getWidth() - 50,
                                height: Ext.getBody().getHeight() - 50,
                                closable: true,
                                layout: 'border',
                                items: [{
                                    xtype: 'rallygrid',
                                    columnCfgs: [
                                        'FormattedID',
                                        'Name',
                                        'Owner'
                                    ],
                                    storeConfig: {
                                        model: 'userstory'
                                    }
                                }]
                            }).show();
                        }
                    });
                }
            }
        });
    },

    _displayGridGivenStore: function(store,field_names){
        this.down('#grid_box1').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: field_names
        });
    },

    _displayGridGivenRecords: function(records,field_names){
        var store = Ext.create('Rally.data.custom.Store',{
            data: records
        });

        var cols = Ext.Array.map(field_names, function(name){
            return { dataIndex: name, text: name, flex: 1 };
        });
        this.down('#grid_box2').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: cols
        });
    },

    getSettingsFields: function() {
        var check_box_margins = '5 0 5 0';
        return [{
            name: 'saveLog',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: check_box_margins,
            boxLabel: 'Save Logging<br/><span style="color:#999999;"><i>Save last 100 lines of log for debugging.</i></span>'

        }];
    },

    getOptions: function() {
        var options = [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];

        return options;
    },

    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }

        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{
            showLog: this.getSetting('saveLog'),
            logger: this.logger
        });
    },

    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }

});
