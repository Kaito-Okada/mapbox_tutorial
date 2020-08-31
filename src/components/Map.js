import React, {Component} from 'react';
import _env from '../config/env';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import axios from 'axios';

class Map extends Component {
    constructor(props){
        super(props);
        this.state = {
            mapbox_map:null,
            colordata:null
        };
    }

    async createmap(){
        let map = new mapboxgl.Map({
            /* 地図を表示させる要素のid */
            container: this.container,
            /* 地図styleID。YOLPではLayerSetIdに相当する。*/
            style: {
                version: 8,
                sources: {
                    cyberjapandata_std: {
                    type: "raster",
                    tiles: [
                    "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
                    ],
                    tileSize: 256
                    },
                    // cyberjapandata_pale: {
                    //     type: "raster",
                    //     tiles: [
                    //     "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
                    //     ],
                    //     tileSize: 256
                    // },
                    "500m_mesh_source": {
                        type: "vector",
                        tiles: [
                        "https://demo-sip7map.datacradle.jp/tile/data/japan_500m_mesh/{z}/{x}/{y}.pbf"
                        ]
                    }
                },
                layers: [
                    {
                        id: "cyberjapandata_std_layer", // 固有のid
                        type: "raster",
                        source: "cyberjapandata_std", // sourcesの対応するkey
                        minzoom: 0,
                        maxzoom: 18
                    },
                    // {
                    //     id: "cyberjapandata_pale_layer", // 固有のid
                    //     type: "raster",
                    //     source: "cyberjapandata_pale", // sourcesの対応するkey
                    //     minzoom: 0,
                    //     maxzoom: 18
                    // },
                    {
                        id: "500m_mesh_layer",
                        type: "fill",
                        source: "500m_mesh_source",
                        "source-layer": "japan_500m_mesh",
                        paint: {
                        "fill-color": "rgba(0,0,0,0)",
                        "fill-outline-color": "rgba(255,0,0,1)"
                        }
                    }
                ]
            },
            /* 地図の初期緯度経度[lng,lat] */
            center: [132.45944, 34.39639],
            /* 地図の初期ズームレベル */
            zoom: 11,
            accessToken:_env.mapboxAccessToken
        });
        
        // Add zoom and rotation controls to the map.
        // map.addControl(new mapboxgl.NavigationControl());

        this.setState({mapbox_map: map})

        // 引数を設定することで，引数生成まで処理が待たれる よって，ここでthis.state.mapを参照すると，上のsetStateと並行処理をしてしまって，
        // this.state.mapが空のままfetchColor()を走らせてしまう．

        await this.fetchColor(map)
    }

    //  async 関数について調べる
    // async 関数は非同期処理になる 順番無視して呼び出される，mapが作られる前に走ってしまうと，参照したところで空だからエラー
    async fetchColor(tmpmap){
        let mapBounds = tmpmap.getBounds();
        let newBounds = {}
        newBounds["_southWest"] = mapBounds["_sw"];
        newBounds["_northEast"] = mapBounds["_ne"];
        await axios
        .get(`${_env.demoAPI}/numData`, {
          params: {
            cityCode: "1f9352af60b0366b589326faf49a2343",
            year: 2000,
            selectedLayer: 1,
            selectedDataType: 1,
            mapBounds: newBounds
          }
        })
        .then(res => {
          console.log(res.data);
          if (Object.keys(res.data).length > 0) {
              this.setState({colordata: res.data})
          }
        });
    }

    setMeshColor(expArray) {
        let map = this.state.mapbox_map;
        map.setPaintProperty("500m_mesh_layer", "fill-color", expArray);
        this.setState({mapbox_map: map})
    }
    getThresholdColor(value) {
        const thresholds = _env.THRESHOLD2048;
        let color = "";
        for (let [key, colorValue] of Object.entries(thresholds)) {
          if (Number(key) > value) {
            break;
          } else {
            color = colorValue;
          }
        }
        return color;
    }
    reColor(){
        let expressionList = ["case"];
        for (let [key, value] of Object.entries(this.state.colordata)) {
            let color = this.getThresholdColor(value);
            expressionList.push(["==", ["get", "GRID_CODE"], key]);
            expressionList.push(color);
        }
        expressionList.push("rgba(0,0,0,0)");
        this.setMeshColor(expressionList);
    }

    componentDidMount(){
        // Promise.allは非同期関数のためにある…createMap()はasyncがついたら非同期だけど，
        // ついてなかったら非同期じゃない 
        // createMap()関数内でfetchColor(非同期関数async)を待って，.thenが走る
        // awaitを適切につけることで関数の終了タイミングがawait hoge()関数の終了を待ってからになる
        Promise.all([this.createmap()]).then(()=>
            // console.log(this.state.colordata)
            this.reColor()
        )
    }

    render(){
        return(
            <div 
                className='map'
                ref={e => (this.container = e)}
            ></div>                
        );
    }
}

export default (Map);
