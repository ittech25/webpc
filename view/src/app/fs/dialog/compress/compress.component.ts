import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServerAPI } from 'src/app/core/core/api';
import { ToasterService } from 'angular2-toaster';
import { I18nService } from 'src/app/core/i18n/i18n.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileInfo, Dir } from '../../fs';
import { isString } from 'util';
import { interval, Subscription } from 'rxjs';

interface Target {
  dir: Dir
  source: Array<FileInfo>
}
interface Message {
  cmd: number
  error: string
  val: string
  fileInfo: FileInfo
}

// CmdError 錯誤
const CmdError = 1
// CmdHeart websocket 心跳防止瀏覽器 關閉不獲取 websocket
const CmdHeart = 2
// CmdProgress 更新進度
const CmdProgress = 3
// CmdDone 操作完成
const CmdDone = 4
// CmdInit 初始化
const CmdInit = 5

@Component({
  selector: 'app-compress',
  templateUrl: './compress.component.html',
  styleUrls: ['./compress.component.scss']
})
export class CompressComponent implements OnInit, OnDestroy {
  constructor(private toasterService: ToasterService,
    private i18nService: I18nService,
    private matDialogRef: MatDialogRef<CompressComponent>,
    @Inject(MAT_DIALOG_DATA) public target: Target,
  ) { }
  private _subscriptionPing: Subscription
  ngOnInit(): void {
    if (this.target.source.length == 1) {
      this.name = this.target.source[0].name
    } else if (this.target.dir.dir) {
      const index = this.target.dir.dir.lastIndexOf('/')
      if (index != -1) {
        this.name = this.target.dir.dir.substring(index + 1)
      }
    }
    if (!isString(this.name) || this.name == '') {
      this.name = 'archive'
    }
    this._subscriptionPing = interval(1000 * 30).subscribe(() => {
      if (this._websocket) {
        this._websocket.send(JSON.stringify({
          cmd: CmdHeart,
        }))
      }
    })
  }
  private _websocket: WebSocket
  get disabled(): boolean {
    if (this._websocket) {
      return true
    }
    return false
  }
  private _closed: boolean
  name: string
  ngOnDestroy() {
    this._closed = true
    if (this._websocket) {
      this._websocket.close()
      this._websocket = null
    }
    this._subscriptionPing.unsubscribe()
  }
  onSubmit() {
    if (this._closed || this._websocket) {
      return
    }
    const url = ServerAPI.v1.fs.websocketURL([
      this.target.dir.root, this.target.dir.dir,
      'compress',
    ])
    const websocket = new WebSocket(url)
    this._websocket = websocket
    websocket.onerror = (evt) => {
      websocket.close()
      console.warn(evt)
      if (this._websocket != websocket) {
        return
      }
      this.toasterService.pop('error', undefined, 'connect websocket error')
      this._websocket = null
    }
    websocket.onopen = (evt) => {
      if (this._websocket != websocket) {
        websocket.close()
        return
      }
      websocket.onclose = (evt) => {
        websocket.close()
        console.warn(evt)
        if (this._websocket != websocket) {
          return
        }
        this.toasterService.pop('error', undefined, 'websocket closed')
        this._websocket = null
      }
      websocket.onmessage = (evt) => {
        if (this._websocket != websocket) {
          websocket.close()
          return
        }
        if (isString(evt.data)) {
          try {
            this._onMessage(JSON.parse(evt.data))
          } catch (e) {
            console.warn('ws-compress', e)
          }
        } else {
          console.warn(`ws-compress unknow type`, evt.data)
        }
      }
      const names = new Array<string>()
      for (let i = 0; i < this.target.source.length; i++) {
        const element = this.target.source[i];
        names.push(element.name)
      }
      // send names
      websocket.send(JSON.stringify({
        'cmd': CmdInit,
        'name': `${this.name}.tar.gz`,
        'names': names,
      }))
    }
  }
  onClose() {
    this.matDialogRef.close()
  }
  progress: string
  _onMessage(msg: Message) {
    switch (msg.cmd) {
      case CmdError:
        this.toasterService.pop('error', undefined, msg.error)
        break;
      case CmdProgress:
        this.progress = msg.val
        break;
      case CmdDone:
        this._websocket.close()
        this._websocket = null
        this.toasterService.pop('success', undefined, this.i18nService.get('Compress done'))
        this.matDialogRef.close(new FileInfo(this.target.dir.root, this.target.dir.dir, msg.fileInfo))
        break
      default:
        console.warn(`ws-compress unknow msg`, msg)
        break;
    }
  }
}
