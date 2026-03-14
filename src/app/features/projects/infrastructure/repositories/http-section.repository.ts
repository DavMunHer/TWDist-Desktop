import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Section } from '../../domain/entities/section.entity';
import { SectionRepository } from '../../domain/repositories/section.repository';
import { SectionDto } from '../dto/section.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { SectionMapper } from '../mappers/section.mapper';
import { requiresAuthContext } from '@shared/interceptors/auth-context.token';

@Injectable()
export class HttpSectionRepository extends SectionRepository {
  constructor(private http: HttpClient) {
    super();
  }

  create(section: Section): Observable<Section> {
    const dto = SectionMapper.toCreateDto(section);
    return this.http
      .post<SectionDto>(`/projects/${section.projectId}/section/create`, dto, requiresAuthContext())
      .pipe(map(responseDto => SectionMapper.toDomain(responseDto, section.projectId)));
  }

  update(section: Section): Observable<Section> {
    const dto = SectionMapper.toDto(section);
    return this.http
      .put<SectionDto>(`/sections/${section.id}`, dto, requiresAuthContext())
      .pipe(map(responseDto => SectionMapper.toDomain(responseDto, section.projectId)));
  }

  delete(sectionId: string): Observable<void> {
    return this.http.delete<void>(`/sections/${sectionId}`, requiresAuthContext());
  }

  findById(sectionId: string): Observable<Section> {
    throw new Error('Not implemented yet');
  }
}
