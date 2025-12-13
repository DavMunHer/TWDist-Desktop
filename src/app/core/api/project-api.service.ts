import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProjectDto } from './dto/project/project.dto';
import { map } from 'rxjs';
import { projectFromDto } from './mappers/project.mapper';
import { SectionDto } from './dto/section/section.dto';
import { TaskDto } from './dto/task/task.dto';
import { CreateSectionDto } from './dto/section/create-section.dto';
import { CreateTaskDto } from './dto/task/create-task.dto';

@Injectable({
  providedIn: 'root'
})
export class ProjectApiService {
  private http = inject(HttpClient);

  loadProject(projectId: string) {
    return this.http
      .get<ProjectDto>(`/api/projects/${projectId}`)
      .pipe(
        map(dto => projectFromDto(dto))
      );
  }

  createSection(projectId: string, dto: CreateSectionDto) {
    return this.http.post<SectionDto>(
      `/api/projects/${projectId}/sections`,
      dto
    );
  }

  createTask(sectionId: string, dto: CreateTaskDto) {
    return this.http.post<TaskDto>(
      `/api/sections/${sectionId}/tasks`,
      dto
    );
  }

}
