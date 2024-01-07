import { parse, SFCDescriptor } from 'vue/compiler-sfc';
import * as babel from '@babel/core';
import * as t from '@babel/types';
import generate from '@babel/generator';

let componentName = '';
let config: {
    include: string[],
    prefix: string,
    suffix: string,
};

export function componentsRename({
    include = ['index.vue', 'Index.vue'],
    prefix = '',
    suffix = '',
} = {}) {
    config = {
        include,
        prefix,
        suffix,
    };
    return {
        name: 'vite-plugin-components-plus',
        enforce: 'pre',
        transform(code, id) {
            if (config.include.find((item:string) => id.endsWith(item))) {
                const { descriptor } = parse(code);
                // 获取组件名称
                componentName = getComponentName(id, descriptor);
                // 获取script的lang属性
                const lang = getLang(descriptor);
                // 不存在script
                if(!descriptor.script) {
                    return `
                        <script lang='${lang}'>
                            export default { name : '${componentName}'}
                        </script>
                        ${code}`;
                }else{
                    // 存在script
                    return changeScriptName(descriptor, code);
                }
            }
        }
    };
}
// 获取script的lang属性
function getLang(descriptor: SFCDescriptor) {
    return descriptor.script?.lang || descriptor.scriptSetup?.lang;
}

// 获取文件夹名称
function getFolderName(id: string) {
    const arr = id.split('/');
    return arr[arr.length - 2];
}

// 获取组件名称
function getComponentName(id: string, descriptor: SFCDescriptor) {
    if(typeof descriptor.scriptSetup?.attrs?.name === 'string') {
        return descriptor.scriptSetup.attrs.name;
    }
    const folderName = getFolderName(id);
    const componentName = trnasformLineToHump(folderName);
    return config.prefix + componentName + config.suffix;
}

// 将横线命名转换为驼峰命名
function trnasformLineToHump(str: string) {
    return str.replace(/-(\w)/g, function (all, letter) {
        return letter.toUpperCase();
    });
}
// 设置declaration对象导出的name属性
function changeDefaultExportObject(declaration) {
    let hasNameProperty = false;
    for (const property of declaration.properties) {
        // 如果已经存在name属性,则不需要添加
        if (t.isObjectProperty(property) && t.isIdentifier(property.key, { name: 'name' })) {
            hasNameProperty = true;
            break;
        }
    }
    if (!hasNameProperty) {
        const nameProperty = t.objectProperty(
            t.identifier('name'),
            t.stringLiteral(componentName)
        );
        declaration.properties.push(nameProperty);
    }
}
// 修改script的name属性
function changeScriptName(descriptor: SFCDescriptor, code:string) {
    const ast = babel.parse(descriptor.script.content, {
        sourceType: 'module',
        presets: ['@babel/preset-typescript'],
        // 虚拟的文件名,防止babel报错
        filename: 'file.' + descriptor.script.lang || 'ts',
    });
    let defaultExportObject;
    // 遍历ast
    babel.traverse(ast, {
        ExportDefaultDeclaration(path) {
            const declaration = path.node.declaration;
            // defineComponent
            if (t.isCallExpression(declaration) && t.isIdentifier(declaration.callee, { name: 'defineComponent' })) {
                defaultExportObject = declaration.arguments[0];
                changeDefaultExportObject(defaultExportObject);
            }
            // 默认导出对象
            if (t.isObjectExpression(declaration)) {
                defaultExportObject = declaration;
                changeDefaultExportObject(defaultExportObject);
            }
        },
    });
    const { code: newCode } = generate.default(ast);
    return code.replace(descriptor.script.content, newCode);
}