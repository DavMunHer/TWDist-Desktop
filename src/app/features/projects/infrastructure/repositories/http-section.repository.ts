import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Section, SectionRepository } from '../../domain';
import { SectionDto, CreateSectionDto } from '../dto';
import { SectionMapper } from '../mappers/section.mapper';

@Injectable()
export class HttpSectionRepository extends SectionRepository {
  constructor(private http: HttpClient) {
    super();
  }

  create(section: Section): Observable<Section> {
    const dto = SectionMapper.toCreateDto(section);
    return this.http
      .post<SectionDto>(`/api/projects/${section.projectId}/sections`, dto)
      .pipe(map(responseDto => SectionMapper.toDomain(responseDto, section.projectId)));
  }

  update(section: Section): Observable<Section> {
    const dto = SectionMapper.toDto(section);
    return this.http
      .put<SectionDto>(`/api/sections/${section.id}`, dto)
      .pipe(map(responseDto => SectionMapper.toDomain(responseDto, section.projectId)));
  }

  delete(sectionId: string): Observable<void> {
    return this.http.delete<void>(`/api/sections/${sectionId}`);
  }

  findById(sectionId: string): Observable<Section> {
    throw new Error('Not implemented yet');
  }
}
