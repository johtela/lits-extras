import * as tt from 'taitto'
let svg = tt.svg

interface Module {
    url?: string
    dependencies: string[]
    node?: tt.Node
}

interface DependencyGraph {
    [name: string]: Module
}

let arrow: tt.Arrow = {
    closed: false,
    className: "arrow",
    positions: [tt.ArrowPos.Destination],
    width: 5,
    length: 5
}

async function loadDependencies(url: string): Promise<DependencyGraph> {
    let resp = await fetch(url)
    return resp.ok ? <DependencyGraph>JSON.parse(await resp.text()) : null
}

export async function createDependencyDiagram(params: string, 
    parent: HTMLElement) {
    let pars = params.split(/\s+/)
    let url = pars[0]
    let filter = pars[1] && new RegExp(pars[1])
    let redir = url.substr(0, url.lastIndexOf("/"))
    let dgraph = await loadDependencies(url)
    if (!dgraph)
        throw Error(`Could not load dependency graph from "${url}"`)
    else {
        let modules = Object.getOwnPropertyNames(dgraph)
            .filter(n => !filter || n.match(filter))
        let nodes = modules.map(name => {
            let module = dgraph[name]
            let node: tt.Node = {
                name,
                label: name,
                link: module.url ? redir + "/" + module.url : undefined,
                shape: (p, x, y, w, h) => svg.rect(p, x, y, w, h, 8, 8)
            }
            module.node = node
            return node
        })
        let edges = tt.edges(modules.map(name =>
            dgraph[name].dependencies.filter(dep => dgraph[dep].node)
                .map(dep => <tt.EdgeDef>[dgraph[name].node, dgraph[dep].node]))
            .reduce((a, b) => a.concat(b)), arrow)
        tt.digraph({
            nodes,
            edges,
            direction: 'LR',
            curvedEdges: true,
            ranksep: 16,
            nodesep: 32
        }, parent)
    }
}