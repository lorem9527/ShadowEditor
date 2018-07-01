﻿import UI2 from '../ui2/UI';

/**
 * 场景面板
 * @author mrdoob / http://mrdoob.com/
 */
function ScenePanel(app) {
    this.app = app;
    var editor = this.app.editor;

    var container = new UI2.Div({
        style: 'border-top: 0; padding-top: 20px;'
    });

    // outliner

    function buildOption(object, draggable) {
        var option = document.createElement('div');
        option.draggable = draggable;
        option.innerHTML = buildHTML(object);
        option.value = object.id;

        return option;
    }

    function buildHTML(object) {

        var html = '<span class="type ' + object.type + '"></span> ' + object.name;

        if (object instanceof THREE.Mesh) {

            var geometry = object.geometry;
            var material = object.material;

            html += ' <span class="type ' + geometry.type + '"></span> ' + geometry.name;
            html += ' <span class="type ' + material.type + '"></span> ' + material.name;

        }

        html += getScript(object.uuid);

        return html;

    }

    function getScript(uuid) {

        if (editor.scripts[uuid] !== undefined) {

            return ' <span class="type Script"></span>';

        }

        return '';

    }

    var ignoreObjectSelectedSignal = false;

    var outliner = new UI2.Outliner({
        editor: editor,
        id: 'outliner',
        onChange: function () {
            ignoreObjectSelectedSignal = true;
            editor.selectById(parseInt(outliner.getValue()));
            ignoreObjectSelectedSignal = false;
        },
        onDblClick: function () {
            editor.focusById(parseInt(outliner.getValue()));
        }
    });

    container.add(outliner);
    container.add(new UI2.Break());

    // background
    var _this = this;

    function onBackgroundChanged() {
        _this.app.call('sceneBackgroundChanged', _this, backgroundColor.getHexValue());
    }

    var backgroundRow = new UI2.Row();

    var backgroundColor = new UI2.Color({
        value: '#aaaaaa',
        onChange: onBackgroundChanged
    });

    backgroundRow.add(new UI2.Text({
        text: '背景',
        style: 'width: 90px;'
    }));
    backgroundRow.add(backgroundColor);

    container.add(backgroundRow);

    // fog

    function onFogChanged() {
        _this.app.call('sceneFogChanged',
            _this,
            fogType.getValue(),
            fogColor.getHexValue(),
            fogNear.getValue(),
            fogFar.getValue(),
            fogDensity.getValue());
    }

    var fogTypeRow = new UI2.Row();
    var fogType = new UI2.Select({
        options: {
            'None': '无',
            'Fog': '线性',
            'FogExp2': '指数型'
        },
        style: 'width: 150px;',
        onChange: function () {
            onFogChanged();
            refreshFogUI();
        }
    });

    fogTypeRow.add(new UI2.Text({
        text: '雾',
        style: 'width: 90px'
    }));

    fogTypeRow.add(fogType);

    container.add(fogTypeRow);

    // fog color

    var fogPropertiesRow = new UI2.Row({
        style: 'display: none; margin-left: 90px;'
    });

    container.add(fogPropertiesRow);

    var fogColor = new UI2.Color({
        value: '#aaaaaa',
        onChange: onFogChanged
    });

    fogPropertiesRow.add(fogColor);

    // fog near

    var fogNear = new UI2.Number({
        value: 0.1,
        style: 'width: 40px;',
        range: [0, Infinity],
        onChange: onFogChanged
    });

    fogPropertiesRow.add(fogNear);

    // fog far

    var fogFar = new UI2.Number({
        value: 50,
        style: 'width: 40px;',
        range: [0, Infinity],
        onChange: onFogChanged
    });

    fogPropertiesRow.add(fogFar);

    // fog density

    var fogDensity = new UI2.Number({
        value: 0.05,
        style: 'width: 40px;',
        range: [0, 0.1],
        precision: 3,
        onChange: onFogChanged
    });

    fogPropertiesRow.add(fogDensity);

    container.render();

    //

    function refreshUI() {
        var camera = editor.camera;
        var scene = editor.scene;

        var options = [];

        options.push(buildOption(camera, false));
        options.push(buildOption(scene, false));

        (function addObjects(objects, pad) {
            for (var i = 0, l = objects.length; i < l; i++) {

                var object = objects[i];

                var option = buildOption(object, true);
                option.style.paddingLeft = (pad * 10) + 'px';
                options.push(option);

                addObjects(object.children, pad + 1);

            }
        })(scene.children, 1);

        outliner.setOptions(options);

        if (editor.selected !== null) {
            outliner.setValue(editor.selected.id);
        }

        if (scene.background) {
            backgroundColor.setHexValue(scene.background.getHex());
        }

        if (scene.fog) {
            fogColor.setHexValue(scene.fog.color.getHex());

            if (scene.fog instanceof THREE.Fog) {
                fogType.setValue("Fog");
                fogNear.setValue(scene.fog.near);
                fogFar.setValue(scene.fog.far);
            } else if (scene.fog instanceof THREE.FogExp2) {
                fogType.setValue("FogExp2");
                fogDensity.setValue(scene.fog.density);
            }
        } else {
            fogType.setValue("None");
        }

        refreshFogUI();
    }

    function refreshFogUI() {
        var type = fogType.getValue();

        fogPropertiesRow.dom.style.display = type === 'None' ? 'none' : '';
        fogNear.dom.style.display = type === 'Fog' ? '' : 'none';
        fogFar.dom.style.display = type === 'Fog' ? '' : 'none';
        fogDensity.dom.style.display = type === 'FogExp2' ? '' : 'none';
    }

    refreshUI();

    // events

    this.app.on('editorCleared.ScenePanel', function () {
        refreshUI();
    });

    this.app.on('sceneGraphChanged.ScenePanel', function () {
        refreshUI();
    });

    this.app.on('objectChanged.ScenePanel', function (object) {
        var options = outliner.options;

        for (var i = 0; i < options.length; i++) {

            var option = options[i];

            if (option.value === object.id) {

                option.innerHTML = buildHTML(object);
                return;

            }

        }
    });

    this.app.on('objectSelected.ScenePanel', function (object) {
        if (ignoreObjectSelectedSignal === true) return;

        outliner.setValue(object !== null ? object.id : null);
    });

    return container;
};

export default ScenePanel;