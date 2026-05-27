package com.jobtracker.mapper;

import com.jobtracker.dto.request.ApplicationCreateRequest;
import com.jobtracker.dto.request.ApplicationUpdateRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.entity.Application;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    @Mapping(target = "id",        ignore = true)  // ← généré par JPA
    @Mapping(target = "createdAt", ignore = true)  // ← géré par @CreatedDate
    @Mapping(target = "updatedAt", ignore = true)  // ← géré par @LastModifiedDate
    Application toEntity(ApplicationCreateRequest request);

    ApplicationResponse toResponse(Application application);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(ApplicationUpdateRequest request,
                                 @MappingTarget Application application);
}