import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';

import { FsRoutingModule } from './fs-routing.module';
import { ListComponent } from './list/list.component';
import { ManagerComponent } from './manager/manager.component';
import { PathComponent } from './path/path.component';
import { FileComponent } from './file/file.component';
import { ImageComponent } from './view/image/image.component';
import { TextComponent } from './view/text/text.component';
import { AudioComponent } from './view/audio/audio.component';
import { VideoComponent } from './view/video/video.component';


@NgModule({
  declarations: [ListComponent, ManagerComponent, PathComponent, FileComponent, ImageComponent, TextComponent, AudioComponent, VideoComponent],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatListModule, MatCardModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatRippleModule,
    MatToolbarModule, MatCheckboxModule, MatMenuModule,
    FsRoutingModule
  ]
})
export class FsModule { }
